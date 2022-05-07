import React from 'react';
import Sidebar from '../../components/Sidebar';
import logo from '../../assets/images/reme-logo.svg'
import navIcon from '../../assets/images/nav-icon.png'
import dashboardIcon from '../../assets/images/dashboard-icon.png'
import networkIcon from '../../assets/images/network-icon.png'
import viewIcon from '../../assets/images/view-icon.png'
import copyIcon from '../../assets/images/copy.svg'
import viewIconPink from '../../assets/images/view-icon-pink.png'
import topHeaderBg from '../../assets/img/top-header-bg.png'
import ApplicationBackground from '../../assets/images/background.6e81d4b2.jpg'
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

    sayHi() {
        var x = document.getElementById("left-menu");
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
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
                <div className="application" style={{backgroundImage: `url(${ApplicationBackground})`}}>
                    <section className="wrapper homepage authtoken">
                    <div className="common-wrapper">
                        <div className="top-header" style={{backgroundImage: `url(${topHeaderBg})`}}>
                            <div className="title">
                                <h1><a href="https://remelife.com"><img src={logo} alt="ReMe Wallet" /></a></h1>
                            </div>
                            <div className="nav-icon-box">
                                <a href="https://wallet.remelife.com/" className="btn secondary green" >Logout</a>
                                <img onClick={this.sayHi} className="nav-icon" src={navIcon}/>
                                <div className="top-menu" id="main-menu">
                                    <ul>
                                        <li><a href="https://remelife.com/token-wallet-explanation/">Need help?</a></li>
                                        <li><a href="https://remelife.com/">ReMeLife</a></li>
                                        <li><a href="https://remelife.com/terms-and-conditions/">Terms & Conditions</a></li>
                                    </ul>
                                </div>
                            </div>
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
                    </div>
                    <div className="terms-links"><a href="https://remelife.com/" target="_blank">ReMeLife</a> | <a
                        href="https://remelife.com/terms-and-conditions/" target="_blank">Terms & Conditions</a></div>
                </section>
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
