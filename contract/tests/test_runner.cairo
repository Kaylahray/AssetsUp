mod test_utils;
mod test_asset_registry;
mod test_asset_lifecycle;
mod test_asset_transfer;
mod test_asset_checkout;
mod test_asset_certificate;
mod test_audit_trail;
mod test_inventory_registry;
mod test_asset_manager;

fn main() {
    // Run all tests
    test_asset_registry::test_register_asset();
    test_asset_registry::test_asset_exists();
    
    test_asset_lifecycle::test_decommission_asset();
    test_asset_lifecycle::test_record_maintenance();
    test_asset_lifecycle::test_get_asset_history();
    
    test_asset_transfer::test_transfer_asset();
    test_asset_transfer::test_batch_transfer();
    test_asset_transfer::test_temporary_assignment();
    test_asset_transfer::test_return_assignment();
    test_asset_transfer::test_is_overdue();
    
    test_asset_checkout::test_checkout_asset();
    test_asset_checkout::test_checkin_asset();
    test_asset_checkout::test_get_overdue_checkouts();
    
    test_asset_certificate::test_issue_certificate();
    test_asset_certificate::test_transfer_certificate();
    test_asset_certificate::test_revoke_certificate();
    
    test_audit_trail::test_create_audit_log();
    test_audit_trail::test_verify_audit_log();
    test_audit_trail::test_verify_audit_chain();
    
    test_inventory_registry::test_register_item();
    test_inventory_registry::test_record_transaction();
    
    test_asset_manager::test_integration_asset_lifecycle();
    test_asset_manager::test_integration_checkout_certificate();
    test_asset_manager::test_integration_audit_trail();
    test_asset_manager::test_high_value_threshold();
    
    println!("All tests passed!");
}
