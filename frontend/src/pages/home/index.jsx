import React from 'react';
import Sidebar from '../../components/Sidebar';
import logo from '../../assets/img/logo_re.png'
import { BrowserRouter, Route, Switch, withRouter } from 'react-router-dom';
import Dashboard from '../dashboard';
import history from "../../history";
import Team from '../Team';
import * as ReferralService from "../../services/referral.sevice";
import { USER_BALANCE, USER_UID } from '../../redux/constants/action';
import { connect } from 'react-redux';
const queryString = require('query-string');


class Home extends React.Component {
    componentDidMount = async () => {
    }

    getUserBalance = (totalBalance) => {
        this.props.userDetails(totalBalance);
    }

    render() {
        const { totalBalance, userData } = this.props;
        return (
            <>
                <div className="container-fluid top-header">
                    <nav className="navbar navbar-expand-lg navbar-light ">
                        <a className="navbar-brand logo" href="#"><img src={logo} /></a>
                        <div>
                            <span className="heading">ReMe Referral Program</span>
                        </div>
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav navbar-nav-ul">
                                <li className="nav-item active">
                                    {/* <label className="nav-link" href="#"> Total Balance:  {totalBalance} </label> */}
                                    <label className="nav-link name" href="#">Welcome : {userData ? userData.first_name : ''} {userData ? userData.last_name : ''} </label>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link" href="#"> Logout <i class="fas fa-sign-out-alt"></i> </a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
                <div className="container-fluid wrapper">
                    <Sidebar />
                    <div className="main-panel">
                        <Switch >
                            <Route exact path='/team/:uid' exact component={Team} />
                            <Route exact path='/home/:uid' component={Dashboard} />
                        </Switch>
                    </div>
                </div>
            </>
        );
    }
}

const mapStateToProps = state => ({
    totalBalance: state.userReducer.totalBalance,
    userData: state.userReducer.userDetails
});

const mapDispatchToProps = dispatch => ({
    userDetails: totalBalance => dispatch({ type: USER_BALANCE, payload: totalBalance }),
    setUid: uid => dispatch({ type: USER_UID, payload: uid }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
