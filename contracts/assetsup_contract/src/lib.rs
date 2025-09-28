#![no_std]
use soroban_sdk::{contract, contracttype, contractimpl, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin
}

#[contract]
pub struct AssetUpContract;

#[contractimpl]
impl AssetUpContract {
    pub fn initialize(env: Env, admin: Address){
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("Contract is already initialized");
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().persistent().get(&DataKey::Admin).unwrap()
    }
}

mod tests;