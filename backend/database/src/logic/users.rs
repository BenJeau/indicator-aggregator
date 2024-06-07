use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::users::{
    CreateUser, DbUserLog, UpdateUser, User, UserLog, UserWithNumLogs, UserWithPassword,
};

#[instrument(skip(pool), ret, err)]
pub async fn is_user_enabled(pool: &PgPool, user_auth_id: &str) -> Result<Option<bool>> {
    Ok(sqlx::query!(
        "SELECT enabled FROM users WHERE auth_id = $1;",
        user_auth_id
    )
    .fetch_optional(pool)
    .await?
    .map(|rec| rec.enabled))
}

#[instrument(skip(pool), ret, err)]
pub async fn create_or_update_user(pool: &PgPool, user: &CreateUser) -> Result<User> {
    sqlx::query_as(include_str!("../sql/users/create_or_update.sql"))
        .bind(&user.auth_id)
        .bind(&user.provider)
        .bind(user.enabled)
        .bind(&user.email)
        .bind(user.verified)
        .bind(&user.name)
        .bind(&user.given_name)
        .bind(&user.family_name)
        .bind(&user.locale)
        .bind(&user.picture)
        .bind(user.roles.iter().cloned().collect::<Vec<_>>())
        .bind(&user.hashed_password)
        .fetch_one(pool)
        .await
}

#[instrument(skip(pool), ret, err)]
pub async fn create_user_log(pool: &PgPool, log: &UserLog) -> Result<()> {
    let trace_id = shared::telemetry::Telemetry::get_trace_id();

    sqlx::query!(
        r#"
INSERT INTO user_logs (user_id, ip_address, user_agent, uri, method, trace_id)
VALUES ($1, $2, $3, $4, $5, $6);
        "#,
        log.user_id,
        log.ip_address,
        log.user_agent,
        log.uri,
        log.method,
        trace_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user(pool: &PgPool, user_id: &str) -> Result<Option<User>> {
    sqlx::query_as!(User, "SELECT id, created_at, updated_at, auth_id, provider, enabled, email, verified, name, given_name, family_name, locale, picture, roles, last_modified_user_id FROM users WHERE id = $1;", user_id)
        .fetch_optional(pool)
        .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_by_auth_id(pool: &PgPool, user_auth_id: &str) -> Result<Option<User>> {
    sqlx::query_as!(
        User,
        "SELECT id, created_at, updated_at, auth_id, provider, enabled, email, verified, name, given_name, family_name, locale, picture, roles, last_modified_user_id FROM users WHERE auth_id = $1;",
        user_auth_id
    )
    .fetch_optional(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_users(pool: &PgPool) -> Result<Vec<UserWithNumLogs>> {
    sqlx::query_as(
        r#"
SELECT users.id, users.created_at, users.updated_at, users.auth_id, users.provider, users.enabled, users.email, users.verified, users.name, users.given_name, users.family_name, users.locale, users.picture, users.roles, count(DISTINCT user_logs.id)::int as "num_logs" FROM users
LEFT JOIN user_logs ON user_logs.user_id = users.id
GROUP BY users.id
            "#,
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_logs(pool: &PgPool, user_id: &str) -> Result<Vec<DbUserLog>> {
    sqlx::query_as!(
        DbUserLog,
        "SELECT * FROM user_logs WHERE user_id = $1;",
        user_id
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn update_user(
    pool: &PgPool,
    user_id: &str,
    user: &UpdateUser,
    request_user_id: &str,
) -> Result<()> {
    if user.enabled.is_none() && user.roles.is_none() {
        return Ok(());
    }

    let roles = user
        .roles
        .clone()
        .map(|roles| roles.into_iter().collect::<Vec<_>>());

    sqlx::query!(
        r#"
    UPDATE users
    SET enabled = COALESCE($2, enabled),
        roles = COALESCE($3, roles),
        last_modified_user_id = $4
    WHERE id = $1;
            "#,
        user_id,
        user.enabled,
        roles as _,
        request_user_id
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_from_email(pool: &PgPool, email: &str) -> Result<Option<UserWithPassword>> {
    sqlx::query_as!(
        UserWithPassword,
        "SELECT * FROM users WHERE email = $1;",
        email
    )
    .fetch_optional(pool)
    .await
}
