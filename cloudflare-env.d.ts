// Optional starter binding; this portfolio does not require a database.
declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
  }
}
