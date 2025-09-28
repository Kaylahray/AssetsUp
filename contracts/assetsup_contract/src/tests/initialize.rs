
#![cfg(test)]

extern crate std;

use soroban_sdk::{testutils::{Address as _,}, Address, Env};
use crate::{AssetUpContract, AssetUpContractClient};

/// Setup test environment with contract and addresses
pub fn setup_test_environment() -> (Env, AssetUpContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AssetUpContract, ());
    let client = AssetUpContractClient::new(&env, &contract_id);
    
    let admin = Address::generate(&env);
    
    (env, client, admin)
}

#[test]
fn test_initialize() {
    let (_env, client, admin) = setup_test_environment();
    client.initialize(&admin);
    let saved_admin = client.get_admin();

    assert_eq!(admin, saved_admin);
}


#[test]
#[should_panic()]
fn test_initialize_panic() {
    let (_env, client, admin) = setup_test_environment();
    client.initialize(&admin);
    client.initialize(&admin);
}