pragma solidity ^0.4.4;
/*
* This is a contract for debloating the state
* @author mhswende
**/
contract Sweeper
{
    //FOR DEBUGGING ONLY
    event Touch(address victim); // Event
    
    //Solidity implentation
    // 0,500 -> 122726 exec cost
    function sol_clean(uint256 s, uint i){
        uint x = s;
        address b = 0;
        for(uint c=0 ; c < i ; c++){
            x = x+s;
            b = address(x/0x1000000000000000000000000);
            b.send(0);
            //Log operation, purely for testing
            Touch(b);
        }
    }
    //Asm implementation
    // Gas measures (log statements disabled)
    // 0, 500 -> 58203 exec cost
    // 0, 5000 -> 580203 exec cost
    function asm_clean(uint s, uint i)
    {

        assembly{
            let seed := calldataload(4)//4 if we're using a named function
            let iterations := calldataload(36)
            let target :=seed
        
        loop:
            target := add(target,seed)
            pop(call(6,div(target,0x1000000000000000000000000),0,0,0,0,0))
            
            //Log operation, purely for testing
            mstore(0,div(target,0x1000000000000000000000000))
            log1(12, 20,0 )
            //End testing
            
            iterations := sub(iterations,1) 
            jumpi(loop, iterations)
        }
    }

}

contract SweepTester
{
    Sweeper s;
    function SweepTester(){
        s = new Sweeper();
    }
    
    /*
    Test data taken from 
    Tx 0x2ca818c26c1e2061206eea43de1eb29095e7071a4e4fe4e5fc6c70f9dd619857
     https://etherscan.io/tx/0x2ca818c26c1e2061206eea43de1eb29095e7071a4e4fe4e5fc6c70f9dd619857
     
     The call data is 0xc983b8da332e2e322e2e312e2e
     Hash of previous block is 0xe277215aaddec233ee91348eac3360caf22933cb8476abb2b5bafb10a31dc8ae
    
     NB: The operation calldata(0) right-pads the input with zeroes
     
     calldata(0)  = 0xc983b8da332e2e322e2e312e2e00000000000000000000000000000000000000
     hash-1       = 0xe277215aaddec233ee91348eac3360caf22933cb8476abb2b5bafb10a31dc8ae
     seed = CALLDATA+Blockhash(blnum -1)

     Expected output, first five addresses (from etherscan)
     https://etherscan.io/address/0x57f5b469c219e0cc397ecb79b466c195e4526797
     https://etherscan.io/address/0x03f08e9ea326d132563e31368e9a2260d67b9b62
     https://etherscan.io/address/0xafeb68d38433c19872fd96f368cd832bc8a4cf2e
     https://etherscan.io/address/0x5be643086540b1fe8fbcfcb04300e3f6bace02f9
     https://etherscan.io/address/0x07e11d3d464da264ac7c626d1d3444c1acf736c5

    Intermediary values: 
    seed1 = 77788714880254563974170405891857433773626328471528739617194097914827086088366
    hex     0xabfada34e10cf0661cbf65bcda3360caf22933cb8476abb2b5bafb10a31dc8ae
    */
    function testSoliditySweep(){
        

        uint input = 0xc983b8da332e2e322e2e312e2e00000000000000000000000000000000000000;
        uint bhash = 0xe277215aaddec233ee91348eac3360caf22933cb8476abb2b5bafb10a31dc8ae;
        uint seed = input + bhash;
        // 77788714880254563974170405891857433773626328471528739617194097914827086088366
        // 0xabfada34e10cf0661cbf65bcda3360caf22933cb8476abb2b5bafb10a31dc8ae
        // Log(seed);
        s.sol_clean(seed,5);
    }
            
    function testAssemblySweep(){
        uint input = 0xc983b8da332e2e322e2e312e2e00000000000000000000000000000000000000;
        uint bhash = 0xe277215aaddec233ee91348eac3360caf22933cb8476abb2b5bafb10a31dc8ae;
        uint seed = input + bhash;
        
        s.asm_clean(seed, 5);
    }
}