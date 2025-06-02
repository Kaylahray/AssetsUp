use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};
use manage_assets::asset_registry::AssetRegistryComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, create_test_asset_info, assert_event_emitted};

#[test]
fn test_register_asset() {
    // Initialize component
    let mut state = AssetRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    // Set caller to admin
    set_caller(admin);
    
    // Register asset
    let result = state.register_asset(asset_hash, asset_id, serial_number);
    
    // Verify result
    assert(result == asset_id, 'Wrong asset ID returned');
    
    // Verify asset exists
    assert(state.asset_exists(asset_id), 'Asset should exist');
    
    // Get asset and verify data
    let asset = state.get_asset(asset_id);
    assert(asset.asset_id == asset_id, 'Wrong asset ID');
    assert(asset.serial_number == serial_number, 'Wrong serial number');
    assert(asset.owner == admin.into(), 'Wrong owner');
    assert(asset.status == AssetStatus::Active, 'Wrong status');
    
    // Verify event count
    let event_count = state.asset_event_count.read(asset_id);
    assert(event_count == 1, 'Should have 1 event');
    
    // Verify event data
    let event = state.asset_events.read((asset_id, 0));
    assert(event.event_type == EventType::Registration, 'Wrong event type');
    assert(event.data == asset_hash, 'Wrong event data');
}

#[test]
#[should_panic(expected: ('Asset already registered',))]
fn test_register_asset_already_exists() {
    // Initialize component
    let mut state = AssetRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    // Set caller to admin
    set_caller(admin);
    
    // Register asset first time
    state.register_asset(asset_hash, asset_id, serial_number);
    
    // Try to register again - should fail
    state.register_asset(asset_hash, asset_id, serial_number);
}

#[test]
#[should_panic(expected: ('Asset does not exist',))]
fn test_get_asset_not_exists() {
    // Initialize component
    let state = AssetRegistryComponent::component_state_for_testing();
    
    // Try to get non-existent asset
    state.get_asset(999);
}

#[test]
fn test_asset_exists() {
    // Initialize component
    let mut state = AssetRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    // Set caller to admin
    set_caller(admin);
    
    // Check asset doesn't exist
    assert(!state.asset_exists(asset_id), 'Asset should not exist');
    
    // Register asset
    state.register_asset(asset_hash, asset_id, serial_number);
    
    // Check asset exists
    assert(state.asset_exists(asset_id), 'Asset should exist');
}
