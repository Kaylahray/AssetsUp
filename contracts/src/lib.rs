#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Env, Symbol, Vec};

// This is the data key for our contract's storage
const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct AssetsUpContract;

#[contracttype]
pub enum DataKey {
    Counter,
}

#[contractimpl]
impl AssetsUpContract {
    /// Initialize the contract with a starting counter value
    pub fn init(env: Env, start_value: u32) {
        env.storage().instance().set(&COUNTER, &start_value);
    }

    /// Increment the counter and return the new value
    pub fn increment(env: Env) -> u32 {
        let mut count: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;
        env.storage().instance().set(&COUNTER, &count);
        count
    }

    /// Get the current counter value
    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }

    /// Say hello to someone
    pub fn hello(env: Env, name: Symbol) -> Vec<Symbol> {
        vec![&env, symbol_short!("Hello"), name]
    }

    /// Reset the counter to zero
    pub fn reset(env: Env) {
        env.storage().instance().set(&COUNTER, &0);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{symbol_short, vec, Env};

    #[test]
    fn test_hello() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AssetsUpContract);
        let client = AssetsUpContractClient::new(&env, &contract_id);

        let result = client.hello(&symbol_short!("World"));
        assert_eq!(
            result,
            vec![&env, symbol_short!("Hello"), symbol_short!("World")]
        );
    }

    #[test]
    fn test_counter_operations() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AssetsUpContract);
        let client = AssetsUpContractClient::new(&env, &contract_id);

        // Test initialization
        client.init(&10);
        assert_eq!(client.get_count(), 10);

        // Test increment
        let new_count = client.increment();
        assert_eq!(new_count, 11);
        assert_eq!(client.get_count()