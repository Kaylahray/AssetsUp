use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};
use manage_assets::asset_registry::AssetRegistryComponent;
use manage_assets::asset_lifecycle::AssetLifecycleComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, create_test_asset_info, assert_event_emitted};

// Helper function to set up test environment
fn setup() -> (AssetRegistryComponent::ComponentState<'static>, AssetLifecycleComponent::ComponentState<'static>) {
    let mut registry_state = AssetRegistryComponent::component_state_for_testing();
    let lifecycle_state = AssetLifecycleComponent::component_state_for_testing();
    
    // Register a test asset
    let admin = create_address(1);
    set_caller(admin);
    
    let asset_id = 123;
    let asset_hash = 456;
    let serial_number = 789;
    
    registry_state.register_asset(asset_hash, asset_id, serial_number);
    
    (registry_state, lifecycle_state)
}

#[test]
fn test_decommission_asset() {
    // Set up test environment
    let (mut registry_state, mut lifecycle_state) = setup();
    
    let asset_id = 123;
    let admin = create_address(1);
    
    // Set caller to admin (owner)
    set_caller(admin);
    
    // Decommission asset
    let result = lifecycle_state.decommission_asset(asset_id);
    
    // Verify result
    assert(result == asset_id, 'Wrong asset ID returned');
    
    // Get asset and verify status
    let asset = registry_state.get_asset(asset_id);
    assert(asset.status == AssetStatus::Decommissioned, 'Wrong status');
    
    // Verify event count
    let event_count = registry_state.asset_event_count.read(asset_id);
    assert(event_count == 2, 'Should have 2 events');
    
    // Verify event data
    let event = registry_state.asset_events.read((asset_id, 1));
    assert(event.event_type == EventType::Decommission, 'Wrong event type');
}

#[test]
#[should_panic(expected: ('Asset does not exist',))]
fn test_decommission_nonexistent_asset() {
    // Set up test environment
    let (_, mut lifecycle_state) = setup();
    
    let non_existent_asset_id = 999;
    let admin = create_address(1);
    
    // Set caller to admin
    set_caller(admin);
    
    // Try to decommission non-existent asset
    lifecycle_state.decommission_asset(non_existent_asset_id);
}

#[test]
#[should_panic(expected: ('Not the asset owner',))]
fn test_decommission_not_owner() {
    // Set up test environment
    let (_, mut lifecycle_state) = setup();
    
    let asset_id = 123;
    let not_owner = create_address(2);
    
    // Set caller to not owner
    set_caller(not_owner);
    
    // Try to decommission asset as non-owner
    lifecycle_state.decommission_asset(asset_id);
}

#[test]
fn test_record_maintenance() {
    // Set up test environment
    let (mut registry_state, mut lifecycle_state) = setup();
    
    let asset_id = 123;
    let maintenance_id = 456;
    let admin = create_address(1);
    let timestamp = 1000u64;
    
    // Set caller to admin
    set_caller(admin);
    
    // Record maintenance
    let result = lifecycle_state.record_maintenance(asset_id, maintenance_id, timestamp);
    
    // Verify result
    assert(result == maintenance_id, 'Wrong maintenance ID returned');
    
    // Verify event count
    let event_count = registry_state.asset_event_count.read(asset_id);
    assert(event_count == 2, 'Should have 2 events');
    
    // Verify event data
    let event = registry_state.asset_events.read((asset_id, 1));
    assert(event.event_type == EventType::Maintenance, 'Wrong event type');
    assert(event.data == maintenance_id, 'Wrong event data');
}

#[test]
fn test_get_asset_history() {
    // Set up test environment
    let (mut registry_state, mut lifecycle_state) = setup();
    
    let asset_id = 123;
    let maintenance_id = 456;
    let admin = create_address(1);
    let timestamp = 1000u64;
    
    // Set caller to admin
    set_caller(admin);
    
    // Record maintenance
    lifecycle_state.record_maintenance(asset_id, maintenance_id, timestamp);
    
    // Get asset history
    let history = lifecycle_state.get_asset_history(asset_id);
    
    // Verify history
    assert(history.len() == 2, 'Should have 2 events');
    assert(history[0].event_type == EventType::Registration, 'First event should be registration');
    assert(history[1].event_type == EventType::Maintenance, 'Second event should be maintenance');
}
