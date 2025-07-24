use starknet::{ContractAddress};

#[derive(Copy, Drop, Serde, starknet::Store)]
enum AssetStatus {
    Active,
    Maintenance,
    Decommissioned,
    CheckedOut,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
enum EventType {
    Registration,
    Transfer,
    Assignment,
    TemporaryAssignment,
    BatchAssignment,
    Maintenance,
    Decommission,
    Checkout,
    CheckIn,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
enum AssignmentType {
    UserToUser,
    UserToDepartment,
    DepartmentToUser,
    DepartmentToDepartment,
    Temporary,
    Checkout,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AssetInfo {
    asset_id: felt252,
    serial_number: felt252,
    registration_time: u64,
    owner: felt252,
    status: AssetStatus,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AssetEvent {
    event_type: EventType,
    timestamp: u64,
    data: felt252,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AssetAssignment {
    assignment_id: felt252,
    asset_id: felt252,
    assignee: felt252,
    assignee_type: felt252, // "user" or "department"
    assignment_type: AssignmentType,
    start_time: u64,
    end_time: u64, // 0 for permanent assignments
    status: felt252, // "active", "returned", "overdue"
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AssetCheckout {
    checkout_id: felt252,
    asset_id: felt252,
    user_id: felt252,
    checkout_time: u64,
    due_time: u64,
    return_time: u64, // 0 if not returned yet
    status: felt252, // "active", "returned", "overdue"
    purpose: felt252,
}

#[starknet::interface]
trait IAssetRegistry<TContractState> {
    fn register_asset(
        ref self: TContractState, 
        asset_hash: felt252, 
        asset_id: felt252, 
        serial_number: felt252
    ) -> felt252;
    
    fn get_asset(self: @TContractState, asset_id: felt252) -> AssetInfo;
    fn asset_exists(self: @TContractState, asset_id: felt252) -> bool;
}

#[starknet::interface]
trait IAssetTransfer<TContractState> {
    fn transfer_ownership(
        ref self: TContractState, 
        asset_id: felt252, 
        new_owner: felt252
    ) -> felt252;
    
    fn get_asset_owner(self: @TContractState, asset_id: felt252) -> felt252;
    
    fn assign_asset(
        ref self: TContractState,
        asset_id: felt252,
        assignee: felt252,
        assignee_type: felt252,
        assignment_type: AssignmentType,
        end_time: u64
    ) -> felt252;
    
    fn batch_assign_assets(
        ref self: TContractState,
        asset_ids: Array<felt252>,
        assignee: felt252,
        assignee_type: felt252,
        assignment_type: AssignmentType,
        end_time: u64
    ) -> felt252;
    
    fn end_assignment(
        ref self: TContractState,
        assignment_id: felt252
    ) -> felt252;
    
    fn get_asset_assignments(
        self: @TContractState,
        asset_id: felt252
    ) -> Array<AssetAssignment>;
    
    fn get_assignee_assets(
        self: @TContractState,
        assignee: felt252,
        assignee_type: felt252
    ) -> Array<felt252>;
}

#[starknet::interface]
trait IAssetLifecycle<TContractState> {
    fn decommission_asset(
        ref self: TContractState, 
        asset_id: felt252
    ) -> felt252;
    
    fn record_maintenance(
        ref self: TContractState, 
        asset_id: felt252, 
        maintenance_id: felt252, 
        timestamp: u64
    ) -> felt252;
    
    fn get_asset_history(
        self: @TContractState, 
        asset_id: felt252
    ) -> Array<AssetEvent>;
}

#[starknet::interface]
trait IAssetCheckout<TContractState> {
    fn checkout_asset(
        ref self: TContractState,
        asset_id: felt252,
        user_id: felt252,
        due_time: u64,
        purpose: felt252
    ) -> felt252;
    
    fn checkin_asset(
        ref self: TContractState,
        checkout_id: felt252,
        condition_notes: felt252
    ) -> felt252;
    
    fn get_asset_checkouts(
        self: @TContractState,
        asset_id: felt252
    ) -> Array<AssetCheckout>;
    
    fn get_user_checkouts(
        self: @TContractState,
        user_id: felt252
    ) -> Array<AssetCheckout>;
    
    fn get_active_checkouts(
        self: @TContractState
    ) -> Array<AssetCheckout>;
    
    fn get_overdue_checkouts(
        self: @TContractState,
        current_time: u64
    ) -> Array<AssetCheckout>;
    
    fn get_checkout(
        self: @TContractState,
        checkout_id: felt252
    ) -> AssetCheckout;
}

#[starknet::interface]
trait IInventoryRegistry<TContractState> {
    fn register_item(
        ref self: TContractState,
        item_id: felt252,
        name: felt252,
        quantity: u256,
        unit: felt252
    ) -> felt252;
    
    fn record_transaction(
        ref self: TContractState,
        item_id: felt252,
        transaction_type: felt252,
        quantity: u256,
        quantity_before: u256,
        quantity_after: u256
    ) -> felt252;
    
    fn get_item(
        self: @TContractState,
        item_id: felt252
    ) -> (felt252, felt252, u256, felt252);
    
    fn get_item_history(
        self: @TContractState,
        item_id: felt252
    ) -> Array<(u64, felt252, u256)>;
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct CertificateMetadata {
    name: felt252,
    description: felt252,
    image_uri: felt252,
    attributes: felt252,
    value: u256,
    currency: felt252,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AssetCertificate {
    certificate_id: felt252,
    asset_id: felt252,
    issue_date: u64,
    issuer: ContractAddress,
    certificate_hash: felt252,
    is_active: bool,
}

#[derive(Copy, Drop, Serde, starknet::Store)]
struct AuditLog {
    log_id: felt252,
    timestamp: u64,
    event_type: EventType,
    asset_id: felt252,
    user_id: felt252,
    action: felt252,
    details: felt252,
    metadata_hash: felt252,
    previous_log_hash: felt252,
    verified: bool,
    verifier: ContractAddress,
}

#[starknet::interface]
trait IAssetCertificate<TContractState> {
    fn issue_certificate(
        ref self: TContractState,
        asset_id: felt252,
        metadata: CertificateMetadata,
    ) -> felt252;
    
    fn transfer_certificate(
        ref self: TContractState,
        certificate_id: felt252,
        to: ContractAddress,
    );
    
    fn revoke_certificate(
        ref self: TContractState,
        certificate_id: felt252,
        reason: felt252,
    );
    
    fn get_certificate(
        self: @TContractState,
        certificate_id: felt252,
    ) -> (AssetCertificate, CertificateMetadata);
    
    fn get_certificate_owner(
        self: @TContractState,
        certificate_id: felt252,
    ) -> ContractAddress;
    
    fn get_owner_certificates(
        self: @TContractState,
        owner: ContractAddress,
    ) -> Array<felt252>;
    
    fn verify_certificate(
        self: @TContractState,
        certificate_id: felt252,
    ) -> bool;
}

#[starknet::interface]
trait IAuditTrail<TContractState> {
    fn create_audit_log(
        ref self: TContractState,
        event_type: EventType,
        asset_id: felt252,
        user_id: felt252,
        action: felt252,
        details: felt252,
    ) -> felt252;
    
    fn verify_audit_log(
        ref self: TContractState,
        log_id: felt252,
    );
    
    fn get_audit_log(
        self: @TContractState,
        log_id: felt252,
    ) -> AuditLog;
    
    fn get_asset_audit_trail(
        self: @TContractState,
        asset_id: felt252,
    ) -> Array<AuditLog>;
    
    fn get_user_audit_trail(
        self: @TContractState,
        user_id: felt252,
    ) -> Array<AuditLog>;
    
    fn verify_audit_chain(
        self: @TContractState,
        start_index: u32,
        end_index: u32,
    ) -> bool;
    
    fn add_verifier(
        ref self: TContractState,
        verifier: ContractAddress,
    );
    
    fn remove_verifier(
        ref self: TContractState,
        verifier: ContractAddress,
    );
}
