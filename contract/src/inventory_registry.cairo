#[contract]
mod InventoryRegistry {
    use starknet::get_caller_address;
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use array::ArrayTrait;
    use option::OptionTrait;
    use traits::Into;
    use traits::TryInto;
    use box::BoxTrait;
    use zeroable::Zeroable;
    use starknet::info::get_block_timestamp;

    struct Storage {
        // Admin address
        admin: ContractAddress,
        
        // Inventory items mapping: item_id => InventoryItem
        inventory_items: LegacyMap<felt252, InventoryItem>,
        
        // Transaction history mapping: item_id => array of transactions
        transactions: LegacyMap<felt252, Array<StockTransaction>>,
        
        // Counter for registered items
        item_count: u256,
    }

    #[derive(Drop, Serde)]
    struct InventoryItem {
        id: felt252,
        name: felt252,
        quantity: u256,
        unit: felt252,
        registered_at: u64,
        last_updated: u64,
    }

    #[derive(Drop, Serde)]
    struct StockTransaction {
        transaction_type: felt252,
        quantity: u256,
        quantity_before: u256,
        quantity_after: u256,
        timestamp: u64,
    }

    #[event]
    fn ItemRegistered(item_id: felt252, name: felt252, quantity: u256, unit: felt252) {}

    #[event]
    fn TransactionRecorded(
        item_id: felt252, 
        transaction_type: felt252, 
        quantity: u256, 
        quantity_before: u256, 
        quantity_after: u256
    ) {}

    #[constructor]
    fn constructor(admin_address: ContractAddress) {
        admin::write(admin_address);
        item_count::write(0);
    }

    #[external]
    fn register_item(item_id: felt252, name: felt252, quantity: u256, unit: felt252) -> felt252 {
        // Only admin can register items
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        // Check if item already exists
        let existing_item = inventory_items::read(item_id);
        assert(existing_item.id.is_zero(), 'Item already registered');
        
        // Create new inventory item
        let timestamp = get_block_timestamp();
        let new_item = InventoryItem {
            id: item_id,
            name: name,
            quantity: quantity,
            unit: unit,
            registered_at: timestamp,
            last_updated: timestamp,
        };
        
        // Store the item
        inventory_items::write(item_id, new_item);
        
        // Increment counter
        let current_count = item_count::read();
        item_count::write(current_count + 1);
        
        // Emit event
        ItemRegistered(item_id, name, quantity, unit);
        
        return item_id;
    }

    #[external]
    fn record_transaction(
        item_id: felt252, 
        transaction_type: felt252, 
        quantity: u256, 
        quantity_before: u256, 
        quantity_after: u256
    ) -> felt252 {
        // Only admin can record transactions
        assert(get_caller_address() == admin::read(), 'Not authorized');
        
        // Check if item exists
        let item = inventory_items::read(item_id);
        assert(!item.id.is_zero(), 'Item not found');
        
        // Create transaction record
        let timestamp = get_block_timestamp();
        let transaction = StockTransaction {
            transaction_type: transaction_type,
            quantity: quantity,
            quantity_before: quantity_before,
            quantity_after: quantity_after,
            timestamp: timestamp,
        };
        
        // Update item quantity
        let updated_item = InventoryItem {
            id: item.id,
            name: item.name,
            quantity: quantity_after,
            unit: item.unit,
            registered_at: item.registered_at,
            last_updated: timestamp,
        };
        inventory_items::write(item_id, updated_item);
        
        // Store transaction in history
        let mut history = transactions::read(item_id);
        history.append(transaction);
        transactions::write(item_id, history);
        
        // Emit event
        TransactionRecorded(item_id, transaction_type, quantity, quantity_before, quantity_after);
        
        return item_id;
    }

    #[view]
    fn get_item(item_id: felt252) -> InventoryItem {
        return inventory_items::read(item_id);
    }

    #[view]
    fn get_transaction_history(item_id: felt252) -> Array<StockTransaction> {
        return transactions::read(item_id);
    }

    #[view]
    fn get_item_count() -> u256 {
        return item_count::read();
    }
}
