const User = require("models/user");
const { ObjectId } = require("mongoose").Types;
const crypto = require("crypto");

const axios = require("axios");
const queryString = require("query-string");

const {
  KAKAO_API_KEY: kakaoApiKey,
  KAKAO_ADMIN_KEY: kakaoAdminKey
} = process.env;
const redirect_uri = `http://dev.api.authentication.dmcho.com:4000/api/kakao/redirect`;

let kakaoCtrl = {};

kakaoCtrl.authorize = async ctx => {
  const path = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoApiKey}&redirect_uri=${redirect_uri}&response_type=code`;
  ctx.redirect(path);
};

kakaoCtrl.redirect = async ctx => {
  let data = {
    grant_type: "authorization_code",
    client_id: kakaoApiKey,
    redirect_uri: redirect_uri,
    code: ctx.request.query.code
  };

  let options = {
    method: "POST",
    url: `https://kauth.kakao.com/oauth/token`,
    data: queryString.stringify(data)
  };

  let exdays = 1; // one day
  let now = new Date();
  now.setTime(now.getTime() + exdays * 24 * 60 * 60 * 1000);

  let result = await customAxios(options)
    .then(async res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
      if (res.data) {
        ctx.cookies.set("dmcho:kakao", res.data.access_token, {
          domain: ".authentication.dmcho.com",
          expires: now
        });

        // return await kakaoCtrl.getUserInfo(res.data);
        // kakaoCtrl.postUnlink(res.data);
        kakaoCtrl.postTalkMessage(res.data);
      }
    })
    .catch(async err => {
      console.log(`${options.url} .catch()`);
      console.log(err.response);
      return err.response;
    });

  ctx.body = `result`;
};

kakaoCtrl.postLogout = async data => {
  let options = {
    method: "POST",
    url: `https://kapi.kakao.com/v1/user/logout`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  };

  customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
      res.data;
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(options);
      console.log(err.response);
    });
};

kakaoCtrl.postUnlink = async data => {
  let options = {
    method: "POST",
    url: `https://kapi.kakao.com/v1/user/unlink`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  };

  customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
      res.data;
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(options);
      console.log(err.response);
    });
};

kakaoCtrl.connectApp = async data => {
  if (!data.access_token)
    return console.log(`authCode 값이 존재하지 않아 종료합니다.`);

  let options = {
    method: "POST",
    url: `https://kapi.kakao.com/v1/user/signup`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  };
  customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(err.response.data);
    });
};

kakaoCtrl.getUserInfo = async data => {
  let options = {
    method: "POST",
    url: `https://kapi.kakao.com/v2/user/me`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  };

  return customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
      kakaoCtrl.getTalkProfile(data);
      return res.data;
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(options);
      console.log(err.response);
    });
};

kakaoCtrl.getTalkProfile = async data => {
  if (!data.access_token)
    return console.log(`authCode 값이 존재하지 않아 종료합니다.`);

  let options = {
    url: `https://kapi.kakao.com/v1/api/talk/profile`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    }
  };

  // axios(options)
  customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(err.response.data);
    });
};

kakaoCtrl.postTalkMessage = async data => {
  // let kakaoToken = ctx.cookies.get("dmcho:kakao");
  // console.log(kakaoToken);

  if (!data.access_token)
    return console.log(`kakaoToken 값이 존재하지 않아 종료합니다.`);

  let template_object = {
    object_type: "feed",
    content: {
      title: "디저트 사진",
      description: "아메리카노, 빵, 케익",
      image_url:
        "http://mud-kage.kakao.co.kr/dn/NTmhS/btqfEUdFAUf/FjKzkZsnoeE4o19klTOVI1/openlink_640x640s.jpg",
      image_width: 640,
      image_height: 640,
      link: {
        web_url: "http://www.daum.net",
        mobile_web_url: "http://m.daum.net",
        android_execution_params: "contentId=100",
        ios_execution_params: "contentId=100"
      }
    },
    social: {
      like_count: 100,
      comment_count: 200,
      shared_count: 300,
      view_count: 400,
      subscriber_count: 500
    },
    buttons: [
      {
        title: "웹으로 이동",
        link: {
          web_url: "http://www.daum.net",
          mobile_web_url: "http://m.daum.net"
        }
      },
      {
        title: "앱으로 이동",
        link: {
          android_execution_params: "contentId=100",
          ios_execution_params: "contentId=100"
        }
      }
    ]
  };

  let options = {
    method: "POST",
    url: `https://kapi.kakao.com/v2/api/talk/memo/default/send`,
    headers: {
      Authorization: `Bearer ${data.access_token}`
    },
    data: queryString.stringify({
      template_object: JSON.stringify(template_object)
    })
  };

  // axios(options)
  return customAxios(options)
    .then(res => {
      console.log(`${options.url} .then()`);
      console.log(res.data);
    })
    .catch(err => {
      console.log(`${options.url} .catch()`);
      console.log(err.response.data);
    });
};

const customAxios = async options => {
  let axiosOptions = {
    method: options.method ? options.method : "GET",
    url: options.url ? options.url : "",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      charset: "utf-8"
    }
  };
  if (options.headers) {
    Object.keys(options.headers).map(key => {
      axiosOptions.headers[key] = options.headers[key];
    });
  }
  if (options.data) {
    axiosOptions.data = options.data;
  }
  return axios(axiosOptions);
};

module.exports = kakaoCtrl;
