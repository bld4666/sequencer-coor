import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function(hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    await deploy('L1SequencerManager', {
        from: deployer,
        proxy: {
            proxyContract: 'OpenZeppelinTransparentProxy',
            execute: {
                init: {
                    methodName: 'initialize',
                    args: ['0x6B42932BBd042d91CD41dE96251b22cba227dEC7'],
                },
                // onUpgrade: {
                //     methodName: 'afterUpgrade',
                //     args: [],
                // },
            },
        },
        args: [],
        log: true,
    });
};

func.tags = ['1', 'Seq'];
func.dependencies = [];
export default func;
