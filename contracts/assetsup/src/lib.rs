#![no_std]

use crate::error::{Error, handle_error};
use soroban_sdk::{Address, BytesN, Env, contract, contractimpl, contracttype};

pub(crate) mod asset;
pub(crate) mod error;
pub(crate) mod types;

pub use types::*;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
}

#[contract]
pub struct AssetUpContract;

#[contractimpl]
impl AssetUpContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Admin) {
            handle_error(&env, Error::AlreadyInitialized)
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
        Ok(())
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        let key = DataKey::Admin;
        if !env.storage().persistent().has(&key) {
            handle_error(&env, Error::AdminNotFound)
        }

        let admin = env.storage().persistent().get(&key).unwrap();
        Ok(admin)
    }

    // Asset functions
    pub fn register_asset(env: Env, asset: asset::Asset) -> Result<(), Error> {
        // Access control
        asset.owner.require_auth();

        if asset.name.is_empty() {
            panic!("Name cannot be empty");
        }

        let key = asset::DataKey::Asset(asset.id.clone());
        let store = env.storage().persistent();
        if store.has(&key) {
            return Err(Error::AssetAlreadyExists);
        }
        store.set(&key, &asset);
        Ok(())
    }

    pub fn get_asset(env: Env, asset_id: BytesN<32>) -> Result<asset::Asset, Error> {
        let key = asset::DataKey::Asset(asset_id);
        let store = env.storage().persistent();
        match store.get::<_, asset::Asset>(&key) {
            Some(a) => Ok(a),
            None => Err(Error::AssetNotFound),
        }
    }

    /// Tokenize an existing asset by attaching a Stellar token ID.
    ///
    /// Access: Only the contract admin (set during `initialize`) can call this.
    ///
    /// Behavior:
    /// - Loads the asset by `asset_id`.
    /// - Updates `stellar_token_id` with `token_id`.
    /// - Persists the updated asset.
    pub fn tokenize_asset(
        env: Env,
        asset_id: BytesN<32>,
        token_id: BytesN<32>,
    ) -> Result<(), Error> {
        // Enforce admin-only access
        let admin_key = DataKey::Admin;
        if !env.storage().persistent().has(&admin_key) {
            handle_error(&env, Error::AdminNotFound)
        }
        let admin: Address = env.storage().persistent().get(&admin_key).unwrap();
        admin.require_auth();

        // Fetch asset
        let key = asset::DataKey::Asset(asset_id.clone());
        let store = env.storage().persistent();
        let mut a: asset::Asset = match store.get(&key) {
            Some(v) => v,
            None => return Err(Error::AssetNotFound),
        };

        // Update token id
        a.stellar_token_id = token_id;
        store.set(&key, &a);
        Ok(())
    }
}

mod tests;
