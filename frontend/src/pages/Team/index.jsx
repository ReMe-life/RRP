import React, { Component } from 'react'
import './style.css'
import InfiniteTree from 'react-infinite-tree';
import { connect } from 'react-redux';
import { REFERRAL_TEAM, USER_UID, USER_DETAILS, REFERRAL_CODE, USER_TOKEN, USER_BALANCE } from '../../redux/constants/action';
import * as ReferralService from "../../services/referral.sevice";
import Tree from 'react-tree-graph';
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-tree-graph/dist/style.css'
import TreeNode from './treeNode';
import Toggler from './toggler';
import Loader from '../../components/loader';
import sortIcon from '../../assets/img/sortingIcon.png';
import level1Icon from '../../assets/img/level1Icon.png';
import level2Icon from '../../assets/img/level2Icon.png';
const queryString = require('query-string');
var _ = require('lodash');

export class Team extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tree: [{
                "name": this.props.uid
            }],
            refferalTeamList: [],
            refferalTeamListToShow: [],
            binaryTree: {},
            usersArray: [],
            level_1: 0,
            level_2: 0,
            level_3: 0,
            uid: ''

        };
    }

    componentWillMount = async () => {
        let token = queryString.parse(window.location.search).authtoken
        this.props.setUserToken(token);
        let body = {
            jwt: token
        }
        this.setState({ loaded: false })
        await ReferralService.verifyToken(body)
            .then(async (response) => {
                response = response.data;
                if (response.success) {
                    await this.props.setUserDetails(response.result);
                    await this.props.setUid(response.result.id);

                    console.log('response.result -- ', response.result)
                    this.setState({
                        tree: [{
                            "name": response.result.id,
                            'full_name': this.props.userDetails ? this.props.userDetails.first_name + ' ' + this.props.userDetails.last_name : ""
                        }],
                    }, () => {
                        this.getReffrealsHierarchy(response.result.wallet);
                        this.getLevelUsers(response.result.wallet);
                    })
                } else {
                    alert('invalid or expired token!!')
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
    }

    getReffrealsHierarchyByLevel = async (level) => {
        const { uid } = this.state;
        this.setState({
            loaded: false,
            activeLevel: level
        })
        await ReferralService.getReffrealsHierarchyByLevel(uid, level)
            .then(async (response) => {
                response = response.data;
                if (response.success) {
                    this.setState({
                        refferalTeamList: response.data,
                        refferalTeamListToShow: response.data,
                        loaded: true
                    }, () => {
                        this.createRefferalTeamList(0)
                    })
                } else {
                    // this.setState({
                    //     loaded: true
                    // })
                }

            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
    }

    getReffrealsHierarchy = async (uid) => {
        await ReferralService.getReffrealsHierarchy(uid)
            .then(async (response) => {
                this.setState({ uid })
                response = response.data;
                if (response.success) {
                    const treeData = [];
                    if (response.data.length) {
                        // response.data.map(item => {
                        //     treeData.push(
                        //         _.mapKeys(item, (value, key) => {
                        //             let newKey = key;
                        //             if (key === 'from_user') {
                        //                 newKey = 'name';
                        //             }
                        //             return newKey;
                        //         })
                        //     )
                        // });

                        this.setState({
                            usersArray: treeData,
                            refferalTeamList: response.data,
                            refferalTeamListToShow: response.data,
                            loaded: true
                        }, () => {
                            // this.createUserJson(0);
                            this.createRefferalTeamList(0)
                        })

                    }
                } else {
                    // this.setState({
                    //     loaded: true
                    // })
                }

            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
        await ReferralService.getReferralCode()
            .then((response) => {
                response = response.data;
                if (response.success) {
                    let referral_link = 'https://reme-wallet-test.web.app/registration/' + response.data.referral_code
                    this.props.setRerralCode(referral_link);
                } else {
                    alert('Sorry user not found!!')
                }
            })
            .catch((err) => {
                alert('Sorry user not found!!')
            })
        await ReferralService.getMyBalance()
            .then((response) => {
                response = response.data;
                if (response.success) {
                    this.props.setUserBalance(response.data.balance);
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
    }


    getLevelUsers = async (id) => {
        return await ReferralService.getLevelUsers(id)
            .then(async (response) => {
                response = response.data;
                if (response.success) {
                    let users = response.data;
                    users.forEach((item) => {
                        this.setState({
                            ['level_' + item.level]: item.users_count
                        })
                    })
                    // let data = response.data
                    // let full_name = response.data.firstname + ' ' + response.data.lastname
                    // return full_name
                } else {
                    return id;
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
    }

    createUserJson = async (index) => {
        const { usersArray } = this.state;
        if (usersArray.length > index) {
            await this.getUserInfo(usersArray[index].name)
                .then((full_name) => {
                    usersArray[index].full_name = full_name;
                    this.setState({ usersArray: usersArray })
                    this.createUserJson(index + 1)
                })
                .catch((err) => {
                    // showNotification("danger", ERRORMSG);
                });
        } else {
            this.setReffrealsHierarchy(usersArray);
        }
    }

    createRefferalTeamList = async (index) => {
        const { refferalTeamList } = this.state;
        if (refferalTeamList.length > index) {
            if (refferalTeamList[index].level > 0) {
                // await this.getUserInfo(refferalTeamList[index].from_user)
                //     .then((full_name) => {
                refferalTeamList[index].full_name = refferalTeamList[index].from_user.slice(0, 4) + '...' + refferalTeamList[index].from_user.substr(refferalTeamList[index].from_user.length - 15) + '(' + refferalTeamList[index].referredCount + ' referred)'
                this.setState({ refferalTeamList: refferalTeamList, refferalTeamListToShow: refferalTeamList })
                this.createRefferalTeamList(index + 1)
                // })
                // .catch((err) => {
                //     // showNotification("danger", ERRORMSG);
                // });
            } else {
                // refferalTeamList[index].full_name = 'User-' + refferalTeamList[index].from_user + '(' + refferalTeamList[index].referredCount + ' referred)'
                // this.setState({ refferalTeamList: refferalTeamList, refferalTeamListToShow: refferalTeamList })
                this.createRefferalTeamList(index + 1)
            }

        }
    }

    transformToTree(arr) {
        var nodes = {};
        return arr.filter(function (obj) {
            var id = obj["name"],
                parentId = obj["uid"];

            nodes[id] = _.defaults(obj, nodes[id], { children: [] });
            parentId && (nodes[parentId] = (nodes[parentId] || { children: [] }))["children"].push(obj);

            return !parentId;
        });
    }

    getUserInfo = async (id) => {
        return await ReferralService.getUserInfo(id)
            .then(async (response) => {
                if (response.status === 200 && response.data.success) {
                    response = response.data
                    let full_name = response.data.firstname + ' ' + response.data.lastname
                    return full_name
                } else {
                    return id;
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });
    }

    setReffrealsHierarchy = async (data) => {
        this.setState(prevState => ({
            tree: [...this.state.tree, ...data]
        }), () => {
            var result = this.transformToTree(this.state.tree);
            this.setState({
                tree: result,
                loaded: true,
                binaryTree: result[0]
            }, () => {
            })
        })
    }



    getDataIndex = async (uid) => {
        return this.state.tree.map(c => c.uid).indexOf(uid);
    }

    search = async (e) => {
        const { refferalTeamList } = this.state;
        let result = refferalTeamList;
        if (e.target.value.length > 0) {
            result = refferalTeamList.filter(
                function (data) { return data.full_name.indexOf(e.target.value) !== -1 }
            );
        }
        this.setState({
            refferalTeamListToShow: result
        })
    }

    render() {
        const { uid, refferalTeam, } = this.props;
        const { tree, loaded, binaryTree, level_1, level_2, level_3, refferalTeamListToShow, activeLevel } = this.state;
        return (
            <div className="paddingGraph refUserTree">

                <div className="row">
                    <div className="col-md-3 text-left treeDiv">
                        <h5>Your Network</h5>
                        <div className="referedUser">
                            <div className="headSec">
                                <h2>Referred Users</h2>
                                <span className="all" onClick={() => this.componentWillMount()}>All</span>
                            </div>
                            <div className="bodySec">
                                <input type="text" placeholder="Search" onChange={(e) => this.search(e)} />
                                <span className="levelSpan"> Level : 0</span> <br />
                                <span className="levelSpan you" > You</span>
                                <PerfectScrollbar>
                                    <ul className="userList p-1">
                                        {loaded ? refferalTeamListToShow.length ? refferalTeamListToShow.map((item, index) =>
                                            item.level > 0 ? <>
                                                <span className="levelSpan"> {index !== 0 && refferalTeamListToShow[index - 1].level !== item.level || index === 0 ? 'Level : ' + item.level : ''}</span>
                                                <tr key={index}>
                                                    <li>{item.full_name}</li>
                                                </tr>
                                            </> : ''
                                        ) : <span>No result found</span> : <Loader />}
                                    </ul>
                                </PerfectScrollbar>
                            </div>
                        </div>

                        {/* {loaded ? <InfiniteTree
                        width="100%"
                        height={400}
                        rowHeight={30}
                        data={tree}
                    >
                        {({ node, tree }) => {
                            // Determine the toggle state
                            let toggleState = '';
                            const hasChildren = node.hasChildren();
                            if ((!hasChildren && node.loadOnDemand) || (hasChildren && !node.state.open)) {
                                toggleState = 'closed';
                            }
                            if (hasChildren && node.state.open) {
                                toggleState = 'opened';
                            }

                            return (
                                <TreeNode
                                    selected={node.state.selected}
                                    depth={node.state.depth}
                                    onClick={event => {
                                        tree.selectNode(node);
                                    }}
                                >
                                    <Toggler
                                        state={toggleState}
                                        onClick={() => {
                                            if (toggleState === 'closed') {
                                                tree.openNode(node);
                                            } else if (toggleState === 'opened') {
                                                tree.closeNode(node);
                                            }
                                        }}
                                    />
                                    <span><i class="jstree-icon jstree-ocl" role="presentation"></i> {node.full_name} {node.name === uid ? "(you)" : ''}</span>
                                </TreeNode>
                            );
                        }}
                    </InfiniteTree> : <Loader />} */}
                    </div>
                    <div className="col-md-3 levelSec">
                        <ul className="levelSec">
                            <li>
                                <span>Level 0</span><a>1<br />member</a>
                            </li>
                            <li onClick={() => this.getReffrealsHierarchyByLevel(1)} >
                                <span>Level 1</span><a className={`${activeLevel === 1 ? 'isBtnActive' : ''}`} >{level_1}<br />member</a>
                            </li>
                            <li onClick={() => this.getReffrealsHierarchyByLevel(2)}>
                                <span>Level 2</span><a className={`${activeLevel === 2 ? 'isBtnActive' : ''}`} >{level_2}<br />member</a>
                            </li>
                            <li onClick={() => this.getReffrealsHierarchyByLevel(3)}>
                                <span>Level 3</span><a className={`${activeLevel === 3 ? 'isBtnActive' : ''}`} >{level_3}<br />member</a>
                            </li>
                        </ul>
                    </div>
                    <div className="col-md-6 treeSec">

                        <ul className="visualizer-container level1">
                            <li>
                                <span className="sorting level1Icon"><img src={level1Icon} alt="icon" /></span>
                                <ul className="nested level2">
                                    <li><span className="sorting subline"><img src={level2Icon} alt="icon" /></span>
                                        <ul className="nested level3">
                                            <li><span className="sorting nestedSubline"><img src={level2Icon} alt="icon" /></span>
                                                <ul className="nested level4">
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                </ul>
                                            </li>
                                            <li><span className="sorting nestedSubline"><img src={level2Icon} alt="icon" /></span>
                                                <ul className="nested level4">
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                    <li><span className="sorting subline"><img src={level2Icon} alt="icon" /></span>
                                        <ul className="nested level3">
                                            <li><span className="sorting nestedSubline"><img src={level2Icon} alt="icon" /></span>
                                                <ul className="nested level4">
                                                    <li><span className="sorting"><img src={level2Icon} alt="icon" /></span></li>
                                                    <li><span className="sorting"><img src={level2Icon} alt="icon" /></span></li>
                                                </ul>
                                            </li>
                                            <li><span className="sorting nestedSubline"><img src={level2Icon} alt="icon" /></span>
                                                <ul className="nested level4">
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                    <li><span className="sorting "><img src={level2Icon} alt="icon" /></span></li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                            {/* Render Tree with data passed as prop */}
                            {/* {loaded ? <Tree
                            data={binaryTree}
                            height={400}
                            width={400}
                            labelProp="full_name"
                            svgProps={{
                                transform: "rotate(90)"
                            }}
                            textProps={{
                                transform: "rotate(270)"
                            }}
                            animated={true}
                            nodeShape="image"
                            nodeProps={{
                                height: 20,
                                width: 20,
                                href: 'https://image.flaticon.com/icons/png/128/64/64572.png'
                            }}

                        /> : <Loader />} */}
                            {/* Render List of traversed nodes passed as prop */}
                        </ul>
                    </div>
                </div>
            </div>

        )
    }
}

const mapStateToProps = state => ({
    uid: state.userReducer.uid,
    refferalTeam: state.userReducer.refferalTeam,
    userDetails: state.userReducer.userDetails
});

const mapDispatchToProps = dispatch => ({
    setRefferalTeam: team => dispatch({ type: REFERRAL_TEAM, payload: team }),
    setUid: uid => dispatch({ type: USER_UID, payload: uid }),
    setUserDetails: payload => dispatch({ type: USER_DETAILS, payload: payload }),
    setRerralCode: payload => dispatch({ type: REFERRAL_CODE, payload: payload }),
    setUserToken: payload => dispatch({ type: USER_TOKEN, payload: payload }),
    setUserBalance: payload => dispatch({ type: USER_BALANCE, payload: payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Team);