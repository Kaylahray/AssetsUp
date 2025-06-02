use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};

#[starknet::component]
mod AssetLifecycleComponent {
    use starknet::{ContractAddress, get_caller_address, get_block_timestamp};
    use manage_assets::interfaces::{AssetInfo, AssetStatus, AssetEvent, EventType};
    use manage_assets::asset_registry::AssetRegistryComponent;

    #[storage]
    struct Storage {}

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        AssetDecommissioned: AssetDecommissioned,
        MaintenanceRecorded: MaintenanceRecorded,
    }

    #[derive(Drop, starknet::Event)]
    struct AssetDecommissioned {
        asset_id: felt252,
        timestamp: u64,
    }

    #[derive(Drop, starknet::Event)]
    struct MaintenanceRecorded {
        asset_id: felt252,
        maintenance_id: felt252,
        timestamp: u64,
    }

    #[embeddable_as(AssetLifecycleImpl)]
    impl AssetLifecycle<
        TContractState,
        +HasComponent<TContractState>,
        +AssetRegistryComponent::HasComponent<TContractState>,
    > of manage_assets::interfaces::IAssetLifecycle<ComponentState<TContractState>> {
        fn decommission_asset(
            ref self: ComponentState<TContractState>, 
            asset_id: felt252
        ) -> felt252 {
            // Get asset registry component
            let mut asset_registry = AssetRegistryComponent::unsafe_new_component_state::<TContractState>();
            
            // Check if asset exists
            assert(asset_registry.asset_exists(asset_id), 'Asset does not exist');
            
            // Get asset info
            let mut asset_info = asset_registry.get_asset(asset_id);
            
            // Check if asset is not already decommissioned
            assert(asset_info.status != AssetStatus::Decommissioned, 'Already decommissioned');
            
            let caller = get_caller_address();
            let caller_felt: felt252 = caller.into();
            
            // Check if caller is the current owner
            assert(asset_info.owner == caller_felt, 'Not the asset owner');
            
            let timestamp = get_block_timestamp();
            
            // Update status
            asset_info.status = AssetStatus::Decommissioned;
            
            // Update asset info in registry
            asset_registry.assets.write(asset_id, asset_info);
            
            // Add decommission event
            asset_registry._add_event(asset_id, EventType::Decommission, timestamp.into());
            
            // Emit event
            self.emit(AssetDecommissioned {
                asset_id,
                timestamp,
            });
            
            asset_id
        }
        
        fn record_maintenance(
            ref self: ComponentState<TContractState>, 
            asset_id: felt252, 
            maintenance_id: felt252, 
            timestamp: u64
        ) -> felt252 {
            // Get asset registry component
            let mut asset_registry = AssetRegistryComponent::unsafe_new_component_state::<TContractState>();
            
            // Check if asset exists
            assert(asset_registry.asset_exists(asset_id), 'Asset does not exist');
            
            // Get asset info
            let mut asset_info = asset_registry.get_asset(asset_id);
            
            // Check if asset is active
            assert(asset_info.status == AssetStatus::Active, 'Asset not active');
            
            // Add maintenance event
            asset_registry._add_event(asset_id, EventType::Maintenance, maintenance_id);
            
            // Emit event
            self.emit(MaintenanceRecorded {
                asset_id,
                maintenance_id,
                timestamp,
            });
            
            maintenance_id
        }
        
        fn get_asset_history(
            self: @ComponentState<TContractState>, 
            asset_id: felt252
        ) -> Array<AssetEvent> {
            let asset_registry = AssetRegistryComponent::unsafe_new_component_state::<TContractState>();
            
            // Check if asset exists
            assert(asset_registry.asset_exists(asset_id), 'Asset does not exist');
            
            let event_count = asset_registry.asset_event_count.read(asset_id);
            let mut events = ArrayTrait::new();
            
            let mut i: u32 = 0;
            while i < event_count {
                let event = asset_registry.asset_events.read((asset_id, i));
                events.append(event);
                i += 1;
            }
            
            events
        }
    }
}
