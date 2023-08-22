import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('L2SequencerRegistry', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: ['0x75Ed9dAeDb29EeEfB812Da9787145C6341531c62'],
                },
                // onUpgrade: {
                //     methodName: 'afterUpgrade',
                //     args: [],
                // },
            },
        },
        log: true,
    });

};

func.tags = ['2', 'Recv'];
func.dependencies = [];
export default func;
