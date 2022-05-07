import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import history from "../history";
import store from '../redux/store';
import * as ReferralService from "../services/referral.sevice";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import {
    FacebookShareButton,
    FacebookIcon
} from "react-share";
import dashboardIcon from "../assets/images/dashboard-icon.png";
import networkIcon from "../assets/images/network-icon.png";
import viewIcon from "../assets/images/view-icon.png";
import copyIcon from "../assets/images/copy.svg";
export class Sidebar extends Component {
    constructor(props) {
        super(props)
        this.state = {
            referral_code: '',
            copied: false
        }
    }

    goToUrl = (url) => {
        history.push({
            pathname: url
        });
    }

    getUserToken = () => {
        var storeData = store.getState();
        return storeData.userReducer.userToken;
    }


    render() {
        const { copied } = this.state;
        const { refferalCode } = this.props
        return (
            <div className="sidebar" id="left-menu">
                <div className="sidebar-wrapper">
                    <ul className="nav">
                        <li className="nav-item">
                            <NavLink className="nav-item" to={'/home?authtoken=' + encodeURIComponent(this.getUserToken())}>
                                <img src={dashboardIcon}/>
                                <p>Dashboard</p>
                            </NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink className="nav-item" to={'/team?authtoken=' + encodeURIComponent(this.getUserToken())}>
                                <img src={networkIcon}/>
                                <p>My Network</p>
                            </NavLink>
                        </li>

                        <li className="nav-item"><a className="active-a"
                                                    href="https://wallet.remelife.com/"><img
                            src={viewIcon}/>
                            <p>View Wallet</p>
                        </a></li>
                    </ul>

                    <div className="address-wrapper invitation-link">Invitation
                        Link: <span>    {refferalCode}</span>
                        <CopyToClipboard text={refferalCode} onCopy={() => this.setState({ copied: true })}>
                            <img src={copyIcon} alt="copy-icon"/>
                        </CopyToClipboard>
                        {copied ? <span style={{ color: '#EB7573' }}> Copied.</span> : null}
                    </div>


                    <div className="container affliateLinkGroup" style={{padding: "10px"}}>
                        <a href="https://remelife.com/token-wallet-explanation/" className="btn green" target='_blank' rel='noreferrer'>Do you need help?</a>
                        <a href="https://remelife.com" className="btn green" target='_blank' rel='noreferrer'>Back to ReMeLife</a>
                    </div>

                </div>
            </div>
        )
    }
}


const mapStateToProps = state => ({
    refferalCode: state.userReducer.refferalCode,
});

const mapDispatchToProps = dispatch => ({
});

export default connect(mapStateToProps, mapDispatchToProps)(Sidebar);
