use shared::crypto::Crypto;
use sqlx::{PgExecutor, PgPool, Result};
use std::collections::HashMap;
use tracing::instrument;

use crate::schemas::secrets::{
    CreateSecret, CreateSourceSecret, GetSecret, Secret, SourceSecret, UpdateSecret,
};

#[instrument(skip_all, ret, err)]
pub async fn create_secret(
    pool: &PgPool,
    data: CreateSecret,
    crypto: &Crypto,
    db_secret: &str,
    user_id: &str,
) -> Result<String> {
    sqlx::query_scalar!(
        "INSERT INTO secrets (name, value, description, expires_at, created_user_id) VALUES ($1, pgp_sym_encrypt_bytea($2, $3), $4, $5, $6) RETURNING id",
        data.name,
        crypto.encrypt(data.value).unwrap(),
        db_secret,
        data.description,
        data.expires_at,
        user_id
    )
    .fetch_one(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_secret(pool: &PgPool, id: &str) -> Result<u64> {
    sqlx::query!("DELETE FROM secrets WHERE id = $1", id)
        .execute(pool)
        .await
        .map_err(Into::into)
        .map(|i| i.rows_affected())
}

#[instrument(skip_all, fields(id = %id), ret, err)]
pub async fn patch_secret(
    pool: &PgPool,
    id: &str,
    secret: UpdateSecret,
    crypto: &Crypto,
    db_secret: &str,
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "UPDATE secrets SET name = COALESCE($1, name), value = COALESCE(pgp_sym_encrypt_bytea($2, $3), value), updated_user_id = $4 WHERE id = $5",
        secret.name,
        secret.value.map(|v| crypto.encrypt(v)).transpose().unwrap(),
        db_secret,
        user_id,
        id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_secrets(pool: &PgPool) -> Result<Vec<Secret>> {
    sqlx::query_as!(
        Secret,
        r#"SELECT secrets.id, secrets.created_at, secrets.updated_at, secrets.name, secrets.description, secrets.expires_at, secrets.created_user_id, secrets.updated_user_id, count(source_secrets.id)::INT as "num_sources!" FROM secrets LEFT JOIN source_secrets ON secrets.id = source_secrets.secret_id GROUP BY secrets.id"#
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn get_source_secrets(pool: &PgPool, source_id: &str) -> Result<Vec<SourceSecret>> {
    sqlx::query_as!(
        SourceSecret,
        r#"SELECT id,
created_at,
updated_at,
secret_id,
name,
description,
required,
created_user_id,
updated_user_id
FROM source_secrets
WHERE source_id = $1"#,
        source_id
    )
    .fetch_all(pool)
    .await
    .map_err(Into::into)
}

#[instrument(skip_all, err)]
pub async fn internal_get_source_secrets(
    pool: &PgPool,
    source_id: &str,
    crypto: &Crypto,
    db_secret: &str,
) -> Result<HashMap<String, String>> {
    let secrets = sqlx::query_as!(GetSecret, r#"SELECT secrets.name, pgp_sym_decrypt_bytea(value, $1)::BYTEA as "value!: _" FROM secrets INNER JOIN source_secrets ON source_secrets.secret_id = secrets.id WHERE source_id = $2"#, db_secret, source_id)
        .fetch_all(pool)
        .await?;

    Ok(HashMap::from_iter(
        secrets
            .into_iter()
            .map(|s| (s.name, crypto.decrypt(&s.value).unwrap())),
    ))
}

#[instrument(skip_all, err)]
pub async fn get_secret_value(
    pool: &PgPool,
    id: &str,
    crypto: &Crypto,
    db_secret: &str,
) -> Result<String> {
    let value: Vec<u8> = sqlx::query_scalar!(r#"SELECT pgp_sym_decrypt_bytea(value, $1)::BYTEA as "value!: _" FROM secrets WHERE id = $2"#, db_secret, id)
        .fetch_one(pool)
        .await?;

    Ok(crypto.decrypt(&value).unwrap())
}

#[instrument(skip(pool), ret, err)]
pub async fn delete_all_source_secrets<'e>(
    pool: impl PgExecutor<'e>,
    source_id: &str,
) -> Result<u64> {
    sqlx::query!("DELETE FROM source_secrets WHERE source_id = $1", source_id)
        .execute(pool)
        .await
        .map(|i| i.rows_affected())
        .map_err(Into::into)
}

#[instrument(skip(pool), ret, err)]
pub async fn add_source_secrets<'e>(
    pool: impl PgExecutor<'e>,
    source_id: &str,
    data: &[CreateSourceSecret],
    user_id: &str,
) -> Result<u64> {
    sqlx::query!(
        "INSERT INTO source_secrets (source_id, secret_id, name, description, required, created_user_id) VALUES ($1, UNNEST($2::TEXT[]), UNNEST($3::TEXT[]), UNNEST($4::TEXT[]), UNNEST($5::BOOLEAN[]), $6)",
        source_id,
        &data.iter().map(|s| s.secret_id.as_ref().map(|id| id.as_str())).collect::<Vec<_>>() as _,
        &data.iter().map(|s| s.name.as_str()).collect::<Vec<_>>() as _,
        &data.iter().map(|s| s.description.as_ref().map(|d| d.as_str())).collect::<Vec<_>>() as _,
        &data.iter().map(|s| s.required).collect::<Vec<_>>(),
        user_id
    )
    .execute(pool)
    .await
    .map(|i| i.rows_affected())
    .map_err(Into::into)
}
