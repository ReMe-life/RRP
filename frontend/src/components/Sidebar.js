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
            <div className="sidebar">
                <div className="sidebar-wrapper">
                    <ul className="nav">
                        <li className="nav-item">
                            <NavLink to={'/home?authtoken=' + encodeURIComponent(this.getUserToken())} activeClassName="active"><i className="fas fa-tv"></i><p >Dashboard</p></NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to={'/team?authtoken=' + encodeURIComponent(this.getUserToken())} activeClassName="active"><i className="fa fa-sitemap tim-icons"></i><p >My Network</p></NavLink>
                        </li>
                    </ul>

                    <div className="container affliateLinkGroup">
                        <div className="row">
                            <a href="https://wallet.remelife.com/" target="_blank" className="col-md-12 inner-group c-p">
                                <h4 >View Wallet</h4>
                            </a></div></div>
                    <div className="container affliateLinkGroup">
                        <div className="row">

                            <div className="col-md-12 inner-group">
                                <h4 >Invitation Link</h4>
                                <p className="userInfo">{refferalCode}</p>
                                <CopyToClipboard text={refferalCode} onCopy={() => this.setState({ copied: true })}>
                                    <i className="fa fa-copy"></i>
                                </CopyToClipboard>
                                {copied ? <span style={{ color: 'blue' }}>Copied.</span> : null}
                            </div></div></div>
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
