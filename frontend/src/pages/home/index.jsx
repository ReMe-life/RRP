import React from 'react';
import Sidebar from '../../components/Sidebar';
import logo from '../../assets/img/logo_re.png'
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom';
import Dashboard from '../dashboard';
import history from "../../history";
import Team from '../Team';
import * as ReferralService from "../../services/referral.sevice";
import {USER_BALANCE, USER_FULL_NAME, USER_UID} from '../../redux/constants/action';
import { connect } from 'react-redux';
const queryString = require('query-string');


class Home extends React.Component {
    componentDidMount = async () => {
    }

    componentWillMount = async () => {
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
    }


    getUserBalance = (totalBalance) => {
        this.props.userDetails(totalBalance);
    }

    render() {
        const { totalBalance, userData, userfullName } = this.props;
        return (
            <>
                <div className="container-fluid top-header">
                    <nav className="navbar navbar-expand-lg navbar-light ">
                        <a className="navbar-brand logo" href="#"><img src={logo} /></a>
                        <div className="siteTitle_style">
                            <span className="heading">ReMe Referral Program</span>
                        </div>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav navbar-nav-ul">
                                <li className="nav-item active">
                                    {/* <label className="nav-link" href="#"> Total Balance:  {totalBalance} </label> */}
                                    <label className="nav-link name" href="#">Welcome : {userfullName} </label>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="https://wallet.remelife.com/"> Logout <i class="fas fa-sign-out-alt"></i> </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="container-fluid wrapper">
                    <Sidebar />
                    <div className="main-panel">
                        <Switch >
                            <Route exact path='/team' exact component={Team} />
                            <Route exact path='/home' component={Dashboard} />
                        </Switch>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    totalBalance: state.userReducer.totalBalance,
    userData: state.userReducer.userDetails,
    userfullName: state.userReducer.userfullName
});

const mapDispatchToProps = dispatch => ({
    userDetails: totalBalance => dispatch({ type: USER_BALANCE, payload: totalBalance }),
    setUid: uid => dispatch({ type: USER_UID, payload: uid }),
    setFullname: payload => dispatch({ type: USER_FULL_NAME, payload: payload })
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
