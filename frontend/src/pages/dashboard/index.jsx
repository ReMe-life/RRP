import React, { Component } from 'react'
import * as ReferralService from "../../services/referral.sevice";
import { CREDIT_HISTORY, USER_UID, USER_INCOME, USER_DETAILS, REFERRAL_CODE, USER_TOKEN, USER_BALANCE } from '../../redux/constants/action';
import { connect } from 'react-redux';
import Loader from '../../components/loader';

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
        let token = this.props.match.params.uid;
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
        await ReferralService.getCreditHistory()
            .then(async (response) => {
                response = response.data;
                if (response.success) {
                    let self = this;
                    self.setState({ usersArray: [] });
                    await response.data.forEach(async function (item, index) {
                        item.from_full_name = await self.getUserInfo(item.from_user);
                        self.state.usersArray.push(item);
                        self.setState({ usersArray: self.state.usersArray, loading: false });
                    });
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

    getUserInfo = async (id) => {
        return await ReferralService.getUserInfo(id)
            .then(async (response) => {
                if (response.status === 200) {
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
        const { usersArray, loading } = this.state;
        const { uid, creditHistory, userIncome, userDetails } = this.props;
        return (
            <>
                <div className="row">
                    <div className="col-md-12"><p className="welcome-line">Welcome : {userDetails ? userDetails.first_name : ''} {userDetails ? userDetails.last_name : ''}</p></div></div>

                <div className="bar-info-col">
                    <div className="row">
                        <div className="value-col custom">
                            <div className="income-info-btns light-pink-bg float-left">
                                <p>
                                    <span className="white-text">Total ReMCs earned :</span>
                                    <span className="white-text"> {userIncome} </span>
                                </p>
                            </div>
                            <div className="income-info-btns light-pink-bg float-right">
                                <p>
                                    <span className="white-text">Your Wallet Address: </span>
                                    <span className="white-text"> {uid}</span>
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="card card-plain bg-white mt-4">
                    <div className="card-header">
                        <h4 className="card-title heading">Level Incomes</h4>
                    </div><div className="card-body"><div className="table-responsive topup">
                        {!loading ? <table id="" className="table tablesorter topup-table">
                            <thead className="text-primary">
                                <tr><th>S.No.</th>
                                    <th>Id</th>
                                    <th>Date</th>
                                    <th>From User </th>
                                    <th>Level</th>
                                    <th className="text-center">Amount(ReMC)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usersArray && usersArray.length ?
                                    usersArray.map((history, index) =>
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{history.id}</td>
                                            <td>{history.time}</td>
                                            <td>{history.from_full_name}</td>
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
    userDetails: state.userReducer.userDetails
});

const mapDispatchToProps = dispatch => ({
    setCreditHistory: history => dispatch({ type: CREDIT_HISTORY, payload: history }),
    setTotalIncome: income => dispatch({ type: USER_INCOME, payload: income }),
    setUid: uid => dispatch({ type: USER_UID, payload: uid }),
    setUserDetails: payload => dispatch({ type: USER_DETAILS, payload: payload }),
    setRerralCode: payload => dispatch({ type: REFERRAL_CODE, payload: payload }),
    setUserToken: payload => dispatch({ type: USER_TOKEN, payload: payload }),
    setUserBalance: payload => dispatch({ type: USER_BALANCE, payload: payload }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
