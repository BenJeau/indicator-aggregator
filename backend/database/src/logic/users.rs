use sqlx::{PgPool, Result};
use tracing::instrument;

use crate::schemas::users::{CreateUser, DbUserLog, UpdateUser, User, UserLog, UserWithNumLogs};

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
        .fetch_one(pool)
        .await
}

#[instrument(skip(pool), ret, err)]
pub async fn create_user_log(pool: &PgPool, log: &UserLog) -> Result<()> {
    sqlx::query!(
        r#"
INSERT INTO user_logs (user_id, ip_address, user_agent, uri, method)
VALUES ($1, $2, $3, $4, $5);
        "#,
        log.user_id,
        log.ip_address,
        log.user_agent,
        log.uri,
        log.method
    )
    .execute(pool)
    .await?;

    Ok(())
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user(pool: &PgPool, user_id: &str) -> Result<Option<User>> {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1;", user_id)
        .fetch_optional(pool)
        .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_user_by_auth_id(pool: &PgPool, user_auth_id: &str) -> Result<Option<User>> {
    sqlx::query_as!(
        User,
        "SELECT * FROM users WHERE auth_id = $1;",
        user_auth_id
    )
    .fetch_optional(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn get_users(pool: &PgPool) -> Result<Vec<UserWithNumLogs>> {
    sqlx::query_as!(
        UserWithNumLogs,
        r#"
    SELECT users.*, count(DISTINCT user_logs.id)::int as "num_logs!" FROM users
    LEFT JOIN user_logs ON user_logs.user_id = users.auth_id
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
        "SELECT user_logs.* FROM user_logs INNER JOIN users ON users.auth_id = user_logs.user_id AND users.id = $1;",
        user_id
    )
    .fetch_all(pool)
    .await
}

#[instrument(skip(pool), ret, err)]
pub async fn update_user(pool: &PgPool, user_id: &str, user: &UpdateUser) -> Result<()> {
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
        roles = COALESCE($3, roles)
    WHERE id = $1;
            "#,
        user_id,
        user.enabled,
        roles as _
    )
    .execute(pool)
    .await?;

    Ok(())
}
