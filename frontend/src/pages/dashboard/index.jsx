import React, { Component } from 'react'
import * as ReferralService from "../../services/referral.sevice";
import { CREDIT_HISTORY, USER_UID, USER_INCOME, USER_DETAILS, REFERRAL_CODE, USER_TOKEN, USER_BALANCE, USER_FULL_NAME } from '../../redux/constants/action';
import { connect } from 'react-redux';
import Loader from '../../components/loader';
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

        await ReferralService.getUserInfo(this.props.uid)
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
                    <div className="col-md-6">
                        <p className="welcome-line">Welcome : {userfullName}</p>
                    </div>
                    <div className="col-md-6">
                        <p className="welcome-line text-right">
                            <span>Your Wallet Address: </span>
                            <span > {userDetails ? userDetails.wallet : '---'}</span>
                        </p>
                    </div></div>

                <div className="bar-info-col">
                    <div className="row">
                        <div className="col-md-6">
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
                        <div className="col-md-6">
                            <div className="value-col custom">

                                <div className="light-pink-bg float-right">
                                    <p className="welcome-line">
                                        <span>Earn CAPS when you increase the size of your network.
                                              Email the invitation link or click to share on your social media to invite family, friends, contacts to become ReMeLife Members.</span>
                                    </p>
                                    <p>
                                        To view an email you can copy and paste to send to contact, please <a onClick={'#'}>Click here</a>.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="card card-plain bg-white mt-4">
                    <div className="card-header">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <h4 className="card-title heading">Level Incomes</h4>
                            </div>
                            <div className="col-md-6">
                                <div className="income-info-btns light-pink-bg float-right">
                                    <p>
                                        <span className="white-text">Total CAPS earned :</span>
                                        <span className="white-text"> {userIncome} </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div><div className="card-body"><div className="table-responsive topup">
                        {!loading ? <table id="" className="table tablesorter topup-table">
                            <thead className="text-primary">
                                <tr><th>No.</th>
                                    <th>Id</th>
                                    <th>Date</th>
                                    <th>From User </th>
                                    <th>Level</th>
                                    <th className="text-center">Amount(CAPS)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersArray && usersArray.length ?
                                    usersArray.map((history, index) =>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{history.id}</td>
                                            <td>{moment(history.time).format('MM/DD/YYYY HH:MM A')}</td>
                                            <td>{history.uid}{history.level == 0 ? ' (You)' : ''}</td>
                                            <td>{history.level}</td>
                                            <td className="text-center">{history.amount}</td>
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
