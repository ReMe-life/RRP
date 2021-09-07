import * as routes from "../globals/endpoints";
import * as api from "../utils/requests";
import store from '../redux/store';
import axios from 'axios';

const getUID = () => {
    var storeData = store.getState();
    return storeData.userReducer.uid;
}
const getWlletAddress = () => {
    var storeData = store.getState();
    return storeData.userReducer.userDetails.wallet;
}
const getJWT = () => {
    var storeData = store.getState();
    return storeData.userReducer.userToken;
}

export const getMyBalance = async () => {
    return await api
        .getReq(routes.getMyBalance + '/' + getWlletAddress())
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getReferralCode = async () => {
    return await api
        .getReq(routes.getReferralCode + '/' + getWlletAddress())
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getCreditHistory = async (uid) => {
    return await api
        .getReq(routes.getCreditHistory + '/' + getWlletAddress())
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getTotalIncome = async (uid) => {
    return await api
        .getReq(routes.getTotalIncome + '/' + getWlletAddress())
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getReffrealsHierarchy = async (uid) => {
    return await api
        .getReq(routes.getReffrealsHierarchy + '/' + uid)
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getReffrealsHierarchyByLevel = async (uid, level) => {
    return await api
        .getReq(routes.getReffrealsHierarchyByLevel + '/' + uid + '/' + level)
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getLevelUsers = async (uid) => {
    return await api
        .getReq(routes.getLevelUsers + '/' + uid)
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const verifyToken = async (body) => {
    return await api
        .PostReq(routes.verifyToken, body)
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};

export const getUserInfo = async (id) => {
    return await api
        .getReq(routes.getUserDetails + '/' + id)
        .then((response) => {
            return response;
        })
        .catch((err) => { });
};