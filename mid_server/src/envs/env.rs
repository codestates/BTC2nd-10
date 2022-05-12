use lazy_static::lazy_static;
use std::env;

lazy_static! {
    #[derive(Debug)]
    pub static ref WALLET_SERVER: String =
         env::var("WALLET_SERVER").unwrap_or_else(|_e| "http://10.0.0.240:3000".into());
    #[derive(Debug)]
    pub static ref LOG_LEVEL: log::LevelFilter = match env::var("LOG_LEVEL")
        .unwrap_or_else(|_| String::from("DEBUG"))
        .to_uppercase()
        .as_str()
    {
        "TRACE" => log::LevelFilter::Trace,
        "DEBUG" => log::LevelFilter::Debug,
        "INFO" => log::LevelFilter::Info,
        "WARN" => log::LevelFilter::Warn,
        "ERROR" => log::LevelFilter::Error,
        _ => panic!("log level must be within ['TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR']"),
    };
}
