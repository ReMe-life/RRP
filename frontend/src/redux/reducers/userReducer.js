import {
    USER_BALANCE,
    USER_UID,
    CREDIT_HISTORY,
    REFERRAL_TEAM,
    USER_INCOME,
    USER_DETAILS,
    REFERRAL_CODE,
    USER_TOKEN, USER_FULL_NAME
} from '../../redux/constants/action';

export default function userDetails(state = {}, action) {
    switch (action.type) {
        case USER_UID:
            return {
                ...state,
                uid: action.payload
            };
        case USER_BALANCE:
            return {
                ...state,
                totalBalance: action.payload
            };
        case CREDIT_HISTORY:
            return {
                ...state,
                creditHistory: action.payload
            };
        case REFERRAL_TEAM:
            return {
                ...state,
                refferalTeam: action.payload
            };
        case USER_INCOME:
            return {
                ...state,
                userIncome: action.payload
            };
        case USER_DETAILS:
            return {
                ...state,
                userDetails: action.payload
            }
        case REFERRAL_CODE:
            return {
                ...state,
                refferalCode: action.payload
            }
        case USER_TOKEN:
            return {
                ...state,
                userToken: action.payload
            }
        case USER_FULL_NAME:
            return {
                ...state,
                userfullName: action.payload
            }
        default:
            return state
    }
}