
rm -rf src/blockchain/idl
rm -rf /Users/serhio/thejungle-programs/programs/stacking/idl.json

anchor idl parse --file /Users/serhio/thejungle-programs/programs/stacking/src/lib.rs > /Users/serhio/thejungle-programs/programs/stacking/idl.json
anchor-client-gen /Users/serhio/thejungle-programs/programs/stacking/idl.json src/blockchain/idl --program-id HDmvmVjbr4d2TTdWSfevBK2uyiAy4A3FrBMNFd9uQoZ5
