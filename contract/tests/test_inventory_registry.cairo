use starknet::{ContractAddress, contract_address_const, get_caller_address, get_block_timestamp};
use starknet::testing::{set_caller_address, set_block_timestamp};
use manage_assets::inventory_registry::InventoryRegistryComponent;
use manage_assets::tests::test_utils::{create_address, set_caller, set_timestamp, assert_event_emitted};

#[test]
fn test_register_item() {
    // Initialize component
    let mut state = InventoryRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let item_id = 123;
    let name = 'Test Item';
    let quantity = 100;
    let unit = 'pcs';
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Register item
    let result = state.register_item(item_id, name, quantity, unit);
    
    // Verify result
    assert(result == item_id, 'Wrong item ID returned');
    
    // Get item and verify data
    let item = state.get_item(item_id);
    assert(item.id == item_id, 'Wrong item ID');
    assert(item.name == name, 'Wrong name');
    assert(item.quantity == quantity, 'Wrong quantity');
    assert(item.unit == unit, 'Wrong unit');
    assert(item.registered_at == current_time, 'Wrong registration time');
    assert(item.last_updated == current_time, 'Wrong last updated time');
    
    // Verify item count
    let count = state.get_item_count();
    assert(count == 1, 'Should have 1 item');
}

#[test]
fn test_record_transaction() {
    // Initialize component
    let mut state = InventoryRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let item_id = 123;
    let name = 'Test Item';
    let initial_quantity = 100;
    let unit = 'pcs';
    let current_time = 1000u64;
    
    // Set current time and caller
    set_timestamp(current_time);
    set_caller(admin);
    
    // Register item
    state.register_item(item_id, name, initial_quantity, unit);
    
    // Set up transaction data
    let transaction_type = 'out';
    let quantity = 20;
    let quantity_before = initial_quantity;
    let quantity_after = initial_quantity - quantity;
    
    // Set time for transaction
    let transaction_time = current_time + 100;
    set_timestamp(transaction_time);
    
    // Record transaction
    let result = state.record_transaction(item_id, transaction_type, quantity, quantity_before, quantity_after);
    
    // Verify result
    assert(result == item_id, 'Wrong item ID returned');
    
    // Get item and verify updated quantity
    let item = state.get_item(item_id);
    assert(item.quantity == quantity_after, 'Wrong quantity after transaction');
    assert(item.last_updated == transaction_time, 'Wrong last updated time');
    
    // Verify transaction history
    let history = state.get_transaction_history(item_id);
    assert(history.len() == 1, 'Should have 1 transaction');
    assert(history[0].transaction_type == transaction_type, 'Wrong transaction type');
    assert(history[0].quantity == quantity, 'Wrong transaction quantity');
    assert(history[0].quantity_before == quantity_before, 'Wrong quantity before');
    assert(history[0].quantity_after == quantity_after, 'Wrong quantity after');
    assert(history[0].timestamp == transaction_time, 'Wrong transaction time');
}

#[test]
#[should_panic(expected: ('Item already registered',))]
fn test_register_item_already_exists() {
    // Initialize component
    let mut state = InventoryRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let item_id = 123;
    let name = 'Test Item';
    let quantity = 100;
    let unit = 'pcs';
    
    // Set caller to admin
    set_caller(admin);
    
    // Register item first time
    state.register_item(item_id, name, quantity, unit);
    
    // Try to register again - should fail
    state.register_item(item_id, name, quantity, unit);
}

#[test]
#[should_panic(expected: ('Item not found',))]
fn test_record_transaction_item_not_found() {
    // Initialize component
    let mut state = InventoryRegistryComponent::component_state_for_testing();
    
    // Set up test data
    let admin = create_address(1);
    let non_existent_item_id = 999;
    
    // Set caller to admin
    set_caller(admin);
    
    // Try to record transaction for non-existent item
    state.record_transaction(non_existent_item_id, 'out', 10, 100, 90);
}
