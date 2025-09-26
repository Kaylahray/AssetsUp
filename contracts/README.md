# AssetsUp Soroban Smart Contract

This directory contains the Soroban smart contract for the AssetsUp project - a Smart Inventory & Asset Management System.

## Overview

This is the foundation smart contract that will eventually support:
- Asset tokenization and registration
- Immutable audit logs
- Role-based permissions
- Stellar-based payments

Currently, this contract serves as a scaffold with basic functionality including a counter and hello world functions.

## Prerequisites

Before you can build and test this contract, you need to install the following:

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env