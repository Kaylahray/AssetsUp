#![no_std]
mod error;

use soroban_sdk::{contract, contracttype, contractimpl, Address, Env};
use crate::error::{Error, handle_error};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
}

#[contract]
pub struct AssetUpContract;

#[contractimpl]
impl AssetUpContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error>{
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Admin) {
            handle_error(&env, Error::AlreadyInitialized)

        }
        Ok(env.storage().persistent().set(&DataKey::Admin, &admin))
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        let key = DataKey::Admin;
        if !env.storage().persistent().has(&key) {
            handle_error(&env, Error::AdminNotFound)
        }

        let admin = env.storage().persistent().get(&key).unwrap();
        Ok(admin)

    }
}

mod tests;
