import * as req from "../utils/http";

export const PostReq = async (path, body) => {
  /**request for post method */
  return await req.http
    .post(path, body)
    .then(response => {
      return response;
    })
    .catch(err => { });
};

export const getReq = async path => {
  /**request for get method */
  return await req.http
    .get(path)
    .then(response => {
      return response;
    })
    .catch(err => { });
};

export const putReq = async (path, body) => {
  /**request for put method */
  return await req.http
    .put(path, body)
    .then(response => {
      return response;
    })
    .catch(err => { });
};

export const delReq = async (path, body) => {
  /**request for delete method */
  return await req.http
    .delete(path, body)
    .then(response => {
      return response;
    })
    .catch(err => { });
};
