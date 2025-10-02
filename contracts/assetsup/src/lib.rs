#![no_std]
use soroban_sdk::{Address, BytesN, Env, String, Vec, contract, contractimpl, contracttype};

pub(crate) mod asset;
pub(crate) mod branch;
pub(crate) mod errors;
pub(crate) mod types;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
}

#[contract]
pub struct AssetUpContract;

#[contractimpl]
impl AssetUpContract {
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();

        if env.storage().persistent().has(&DataKey::Admin) {
            panic!("Contract is already initialized");
        }
        env.storage().persistent().set(&DataKey::Admin, &admin);
    }

    pub fn get_admin(env: Env) -> Address {
        env.storage().persistent().get(&DataKey::Admin).unwrap()
    }

    // Asset functions
    pub fn register_asset(env: Env, asset: asset::Asset) -> Result<(), errors::ContractError> {
        // Access control
        asset.owner.require_auth();

        if asset.name.is_empty() {
            panic!("Name cannot be empty");
        }

        let key = asset::DataKey::Asset(asset.id.clone());
        let store = env.storage().persistent();
        if store.has(&key) {
            return Err(errors::ContractError::AssetAlreadyExists);
        }
        store.set(&key, &asset);
        Ok(())
    }

    pub fn get_asset(
        env: Env,
        asset_id: BytesN<32>,
    ) -> Result<asset::Asset, errors::ContractError> {
        let key = asset::DataKey::Asset(asset_id);
        let store = env.storage().persistent();
        match store.get::<_, asset::Asset>(&key) {
            Some(a) => Ok(a),
            None => Err(errors::ContractError::AssetNotFound),
        }
    }

    // Branch functions
    pub fn create_branch(
        env: Env,
        id: BytesN<32>,
        name: String,
        location: String,
        admin: Address,
    ) -> Result<(), errors::ContractError> {
        // Enforce admin-only access for branch creation
        let contract_admin = Self::get_admin(env.clone());
        contract_admin.require_auth();

        if name.is_empty() {
            panic!("Branch name cannot be empty");
        }

        let key = branch::DataKey::Branch(id.clone());
        let store = env.storage().persistent();
        if store.has(&key) {
            return Err(errors::ContractError::BranchAlreadyExists);
        }

        let branch = branch::Branch {
            id: id.clone(),
            name,
            location,
            admin,
        };

        store.set(&key, &branch);

        // Initialize empty asset list for this branch
        let asset_list_key = branch::DataKey::AssetList(id);
        let empty_asset_list: Vec<BytesN<32>> = Vec::new(&env);
        store.set(&asset_list_key, &empty_asset_list);

        Ok(())
    }

    pub fn add_asset_to_branch(
        env: Env,
        branch_id: BytesN<32>,
        asset_id: BytesN<32>,
    ) -> Result<(), errors::ContractError> {
        // Verify branch exists
        let branch_key = branch::DataKey::Branch(branch_id.clone());
        let store = env.storage().persistent();
        if !store.has(&branch_key) {
            return Err(errors::ContractError::BranchNotFound);
        }

        // Verify asset exists
        let asset_key = asset::DataKey::Asset(asset_id.clone());
        if !store.has(&asset_key) {
            return Err(errors::ContractError::AssetNotFound);
        }

        // Get current asset list
        let asset_list_key = branch::DataKey::AssetList(branch_id);
        let mut asset_list: Vec<BytesN<32>> = store
            .get(&asset_list_key)
            .unwrap_or_else(|| Vec::new(&env));

        // Check if asset is already in the list
        for existing_asset_id in asset_list.iter() {
            if existing_asset_id == asset_id {
                return Ok(()); // Asset already linked, no error
            }
        }

        // Add asset to the list
        asset_list.push_back(asset_id);
        store.set(&asset_list_key, &asset_list);

        Ok(())
    }

    pub fn get_branch_assets(
        env: Env,
        branch_id: BytesN<32>,
    ) -> Result<Vec<BytesN<32>>, errors::ContractError> {
        // Verify branch exists
        let branch_key = branch::DataKey::Branch(branch_id.clone());
        let store = env.storage().persistent();
        if !store.has(&branch_key) {
            return Err(errors::ContractError::BranchNotFound);
        }

        // Get asset list
        let asset_list_key = branch::DataKey::AssetList(branch_id);
        match store.get(&asset_list_key) {
            Some(asset_list) => Ok(asset_list),
            None => Ok(Vec::new(&env)), // Return empty list if no assets
        }
    }

    pub fn get_branch(
        env: Env,
        branch_id: BytesN<32>,
    ) -> Result<branch::Branch, errors::ContractError> {
        let key = branch::DataKey::Branch(branch_id);
        let store = env.storage().persistent();
        match store.get::<_, branch::Branch>(&key) {
            Some(branch) => Ok(branch),
            None => Err(errors::ContractError::BranchNotFound),
        }
    }
}

mod tests;
