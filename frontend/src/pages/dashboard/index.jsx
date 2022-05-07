import React, { Component } from 'react'
import * as ReferralService from "../../services/referral.sevice";
import { CREDIT_HISTORY, USER_UID, USER_INCOME, USER_DETAILS, REFERRAL_CODE, USER_TOKEN, USER_BALANCE, USER_FULL_NAME } from '../../redux/constants/action';
import { connect } from 'react-redux';
import viewIcon from '../../assets/images/view-icon.png'
import copyIcon from '../../assets/images/copy.svg'
import viewIconPink from '../../assets/images/view-icon-pink.png'
import Loader from '../../components/loader';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import moment from 'moment';
import {
    FacebookShareButton,
    FacebookIcon,
    TwitterShareButton,
    TwitterIcon,
    PinterestShareButton,
    PinterestIcon,
    WhatsappShareButton,
    WhatsappIcon,
    LinkedinShareButton,
    LinkedinIcon
} from "react-share";
import { CopyToClipboard } from 'react-copy-to-clipboard';
const queryString = require('query-string');

export class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            usersArray: [],
            loading: true
        };
    }

    componentWillMount = async () => {
        this.setState({ loading: true })
        let token = queryString.parse(window.location.search).authtoken
        this.props.setUserToken(token);
        let body = {
            jwt: token
        }
        await ReferralService.verifyToken(body)
            .then((response) => {
                response = response.data;
                if (response.success) {
                    this.props.setUserDetails(response.result);
                    this.props.setUid(response.result.id);
                } else {
                    alert('invalid or expired token!!')
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });

        await ReferralService.getUserInfo()
            .then((response) => {
                response = response.data;
                if (response.success) {
                    let fullname = response.data ? (response.data.firstname + ' ' + response.data.lastname) : " "
                    this.props.setFullname(fullname)
                } else {
                    alert('invalid or expired token!!')
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });



        await ReferralService.getCreditHistory()
            .then(async (response) => {
                response = response.data;
                if (response.success) {
                    let self = this;
                    self.setState({ usersArray: response.data, loading: false });
                    // await response.data.forEach(async function (item, index) {
                    //     item.from_full_name = await self.getUserInfo(item.from_user);
                    //     self.state.usersArray.push(item);
                    //     self.setState({ usersArray: self.state.usersArray, loading: false });
                    // });
                } else {
                    this.setState({ loading: false })
                }
            })
            .catch((err) => {
                this.setState({ loading: false })
            });

        await ReferralService.getTotalIncome()
            .then((response) => {
                response = response.data;
                if (response.success) {
                    this.props.setTotalIncome(response.data.balance);
                }
            })
            .catch((err) => {
                // showNotification("danger", ERRORMSG);
            });

        await ReferralService.getReferralCode()
            .then((response) => {
                console.log(response)
                response = response.data;
                if (response.success) {
                    console.log("in re")
                    let referral_link = 'https://wallet.remelife.com/registration/' + response.data.referral_code
                    this.props.setRerralCode(referral_link);
                } else {
                    alert('Sorry user not found wooo!!')
                }
            })
            .catch((err) => {

                console.log(err.toString())
                alert('Sorry user not found!! woo2')
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

    componentWillReceiveProps = (props) => {
        // console.log('props ---,', props.creditHistory)
    }
    render() {
        const { usersArray, loading, copied } = this.state;
        const { uid, creditHistory, userIncome, userDetails, refferalCode, userfullName } = this.props;
        return (
            <>
                <div className="row">
                    <div className="wallet-title"><span className="message">Hi,  {userfullName} </span></div>
                    <div className="address-wrapper" style={{marginTop: "3rem"}}>Your Wallet
                        address: <span>{userDetails ? userDetails.wallet : '---'}</span></div>
                </div>

                <div className="card card-plain bg-white mt-4">
                    <div className="card-header">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <h4 className="card-title heading">Registrations and CAPs Earned</h4>
                            </div>
                            <div className="col-md-6">
                                <div className="income-info-btns light-pink-bg float-right">
                                    <span className="white-text">Total CAPS earned :</span><span
                                    className="white-text"> {userIncome}  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive topup">
                            {!loading ? <table id="" className="table tablesorter topup-table">
                                <thead className="text-primary">
                                <tr>
                                    <th>Member No.</th>
                                    <th className="dt">Member Id</th>
                                    <th className="dt">Date Joined</th>
                                    <th className="dt">Level No.</th>
                                    <th className="text-center">CAPs Earned</th>
                                    <th className="dt last">From User </th>
                                    <th className="mob last">View</th>
                                </tr>
                                </thead>
                                <tbody>
                                {usersArray && usersArray.length ?
                                    usersArray.map((history, index) =>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="dt">{history.id}</td>
                                            <td className="dt">{moment(history.time).format('MM/DD/YYYY HH:MM A')}</td>
                                            <td className="dt">{history.level}</td>
                                            <td>{history.amount}</td>
                                            <td className="dt last">{history.uid}{history.level == 0 ? ' (You)' : ''}</td>
                                            <th className="mob last">View</th>
                                        </tr>
                                    ) : <tr>
                                        <td />
                                        <td />
                                        <td> <h4 >No data found!!</h4></td>
                                        <td />
                                        <td />
                                        <td />
                                    </tr>
                                }

                                </tbody>
                            </table> : <Loader />}
                        </div>
                    </div>
                </div>

                <div className="bar-info-col">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="value-col custom">
                                <div className="light-pink-bg float-right">
                                    <p className="welcome-line"><span>Earn CAPS when you increase the size of your network. Email the invitation link or click to share on your social media to invite family, friends, contacts to become ReMeLife Members.</span>
                                    </p>
                                    <p className="view-email">To view an email you can copy and paste to
                                        send to contact, please Click
                                        <Popup trigger={<a  rel='noreferrer' style={{color: 'red'}}> here </a>} modal closeOnDocumentClick>
                                            {close => (
                                                <div>
                                                    <div>
                                                        <h3>Inviting your family,friends & network to join ReMeLife</h3>
                                                        <p>Here's some text that you can copy, paste, edit and send to your friends, in an email or using social media.</p>
                                                        <p>Hi XXX,</p>
                                                        <p>I’ve joined as a member of the ReMeLife Community. I think you'll find it to be of interest to you. And I’d like you to join my network.</p>
                                                        <p>ReMeLife is an online platform that supports families and those that need to be connected, especially when care is involved. ReMeLife provides free apps and many useful services. But perhaps its most unique feature is that when you use ReMeLife’s apps to support and engage with others in your social, family and care network, you earn crypto tokens.</p>
                                                        <p>You earn them as you do those things that you're probably doing already. And you earn them passively in background. They just appear in your wallet. Soon you’ll be able to buy products and trade them for cash.</p>
                                                        <p>So, I'd like to invite you to join my network, and to also build your own. There are no costs, no work involved and no catches. ReMeLife just provides great free apps and a means to monetise your daily digital family and care actions, for your own benefit instead of for the tech giants.</p>
                                                        <p>It’s simple and free. Just visit www.ReMeLife.com, have a look around and then click any ‘Join as a Member’ button (or click https://remelife.com/remelife-membership/) and follow the instructions.</p>
                                                        <p>When you're asked during registration to register for your ReMe Wallet, you'll be asked if you were introduced by anyone (that's me). Please then enter this Referral link URL, so you’ll join only my network: https://wallet.remelife.com/registration/E922J624C????? (enter yours as provided in your wallet).</p>
                                                        <p>That’s it. Do get in touch if you want to learn more about it all.</p>
                                                        <p>Best wishes, XXX</p>
                                                        <h6>It's as easy as that. You'll be earning rewards in no time.</h6>
                                                    </div>
                                                    <CopyToClipboard text={"hello this is from copy"} onCopy={() => this.setState({ copied: true })}>
                                                        <img src={copyIcon} alt="copy-icon"/>
                                                    </CopyToClipboard>
                                                    {copied ? <span style={{ color: '#EB7573' }}> Copied.</span> : null}
                                                    <a className="close" onClick={close}>
                                                        &times;
                                                    </a>
                                                </div>
                                            )}
                                        </Popup>.</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12">
                            <div className="row">
                                <div className="col-md-12 social_icons_underAddress_style">
                                    <TwitterShareButton url={refferalCode}><TwitterIcon className="socialIcon" size={50} /></TwitterShareButton>
                                    <FacebookShareButton url={refferalCode}><FacebookIcon className="socialIcon" size={50} /></FacebookShareButton>
                                    <PinterestShareButton url={refferalCode} media="https://wallet.remelife.com/static/media/reme-logo-dark.2bebd896.svg"> <PinterestIcon className="socialIcon" size={50} /></PinterestShareButton>
                                    <WhatsappShareButton url={refferalCode}><WhatsappIcon className="socialIcon" size={50} /></WhatsappShareButton>
                                    <LinkedinShareButton url={refferalCode}><LinkedinIcon className="socialIcon" size={50} /></LinkedinShareButton>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </>
        )
    }
}

const mapStateToProps = state => ({
    creditHistory: state.userReducer.creditHistory,
    uid: state.userReducer.uid,
    userIncome: state.userReducer.userIncome,
    userDetails: state.userReducer.userDetails,
    refferalCode: state.userReducer.refferalCode,
    userfullName: state.userReducer.userfullName
});

const mapDispatchToProps = dispatch => ({
    setCreditHistory: history => dispatch({ type: CREDIT_HISTORY, payload: history }),
    setTotalIncome: income => dispatch({ type: USER_INCOME, payload: income }),
    setUid: uid => dispatch({ type: USER_UID, payload: uid }),
    setUserDetails: payload => dispatch({ type: USER_DETAILS, payload: payload }),
    setRerralCode: payload => dispatch({ type: REFERRAL_CODE, payload: payload }),
    setUserToken: payload => dispatch({ type: USER_TOKEN, payload: payload }),
    setUserBalance: payload => dispatch({ type: USER_BALANCE, payload: payload }),
    setFullname: payload => dispatch({ type: USER_FULL_NAME, payload: payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
