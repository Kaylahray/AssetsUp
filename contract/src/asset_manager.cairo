#[starknet::contract]
mod AssetManager {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType, AssignmentType, AssetAssignment, AssetCheckout, AssetCertificate, CertificateMetadata, AuditLog};
    use manage_assets::asset_registry::AssetRegistryComponent;
    use manage_assets::asset_transfer::AssetTransferComponent;
    use manage_assets::asset_lifecycle::AssetLifecycleComponent;
    use manage_assets::inventory_registry::InventoryRegistryComponent;
    use manage_assets::asset_checkout::AssetCheckoutComponent;
    use manage_assets::asset_certificate::AssetCertificateComponent;
    use manage_assets::audit_trail::AuditTrailComponent;

    component!(path: AssetRegistryComponent, storage: asset_registry, event: AssetRegistryEvent);
    component!(path: AssetTransferComponent, storage: asset_transfer, event: AssetTransferEvent);
    component!(path: AssetLifecycleComponent, storage: asset_lifecycle, event: AssetLifecycleEvent);
    component!(path: InventoryRegistryComponent, storage: inventory_registry, event: InventoryRegistryEvent);
    component!(path: AssetCheckoutComponent, storage: asset_checkout, event: AssetCheckoutEvent);
    component!(path: AssetCertificateComponent, storage: asset_certificate, event: AssetCertificateEvent);
    component!(path: AuditTrailComponent, storage: audit_trail, event: AuditTrailEvent);

    #[abi(embed_v0)]
    impl AssetRegistryImpl = AssetRegistryComponent::AssetRegistryImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl AssetTransferImpl = AssetTransferComponent::AssetTransferImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl AssetLifecycleImpl = AssetLifecycleComponent::AssetLifecycleImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl InventoryRegistryImpl = InventoryRegistryComponent::InventoryRegistryImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl AssetCheckoutImpl = AssetCheckoutComponent::AssetCheckoutImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl AssetCertificateImpl = AssetCertificateComponent::AssetCertificateImpl<ContractState>;
    
    #[abi(embed_v0)]
    impl AuditTrailImpl = AuditTrailComponent::AuditTrailImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        asset_registry: AssetRegistryComponent::Storage,
        #[substorage(v0)]
        asset_transfer: AssetTransferComponent::Storage,
        #[substorage(v0)]
        asset_lifecycle: AssetLifecycleComponent::Storage,
        #[substorage(v0)]
        inventory_registry: InventoryRegistryComponent::Storage,
        #[substorage(v0)]
        asset_checkout: AssetCheckoutComponent::Storage,
        #[substorage(v0)]
        asset_certificate: AssetCertificateComponent::Storage,
        #[substorage(v0)]
        audit_trail: AuditTrailComponent::Storage,
        
        // Contract admin
        admin: ContractAddress,
        
        // High-value threshold for NFT certificates (in USD cents)
        high_value_threshold: u256,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        AssetRegistryEvent: AssetRegistryComponent::Event,
        #[flat]
        AssetTransferEvent: AssetTransferComponent::Event,
        #[flat]
        AssetLifecycleEvent: AssetLifecycleComponent::Event,
        #[flat]
        InventoryRegistryEvent: InventoryRegistryComponent::Event,
        #[flat]
        AssetCheckoutEvent: AssetCheckoutComponent::Event,
        #[flat]
        AssetCertificateEvent: AssetCertificateComponent::Event,
        #[flat]
        AuditTrailEvent: AuditTrailComponent::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, admin: ContractAddress, high_value_threshold: u256) {
        self.admin.write(admin);
        self.high_value_threshold.write(high_value_threshold);
    }
    
    #[external(v0)]
    fn set_high_value_threshold(ref self: ContractState, threshold: u256) {
        assert(get_caller_address() == self.admin.read(), 'Only admin can set threshold');
        self.high_value_threshold.write(threshold);
    }
    
    #[external(v0)]
    fn get_high_value_threshold(self: @ContractState) -> u256 {
        self.high_value_threshold.read()
    }
}
