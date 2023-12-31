const users = require("../../Models/Users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const nodemailer = require("nodemailer");
require("dotenv").config();

class Controller {
  // [Post] / api/auth/Login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Tìm người dùng trong cơ sở dữ liệu
      const user = await users.findOne({ email });

      if (!user) {
        return res.json({ msg: "Incorrect email or password", status: false });
      }

      // Kiểm tra mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.json({ msg: "Incorrect email or password", status: false });
      } else if (!user.isVerified) {
        return res.json({
          msg: "Please verify your email address before logging in",
          status: false,
        });
      }

      const accessToken = jwt.sign(
        { userId: user._id, fullname: user.username, avatar: user.avatarImage },
        process.env.ACCESS_TOKEN_SECRET
      );
      // Tạo token và gửi về cho người dùng
      return res.status(201).json({ accessToken });
    } catch (err) {
      next(err);
    }
  }

  async loginGoogle(req, res, next) {
    const googleToken = req.body.access_token;

    const headers = {
      Authorization: `Bearer ${googleToken}`,
      "Content-Type": "application/json",
    };

    try {
      const { data } = await axios.get(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        { headers }
      );

      const user = await users.findOne({ email: data.email });

      if (user) {
        if (!user.authGoogleId) {
          user.authGoogleId = data.authGoogleId;
          await user.save();
        }

        const accessToken = jwt.sign(
          {
            userId: user._id,
            fullname: user.username,
            avatar: user.avatarImage,
          },
          process.env.ACCESS_TOKEN_SECRET
        );
        return res.status(201).json({ accessToken });
      }

      const newUser = new users({
        username: data.name,
        authType: "google",
        authGoogleId: data.sub,
        email: data.email,
        isVerified: true,
      });

      newUser.save();

      const accessToken = jwt.sign(
        {
          userId: newUser._id,
          fullname: newUser.username,
          avt: newUser.avatarImage,
        },
        process.env.ACCESS_TOKEN_SECRET
      );
      return res.status(201).json({ accessToken });
    } catch (error) {
      return res.status(500).json({ msg: "server " });
    }
  }

  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const isVerified = false;
      const usernameCheck = await users.findOne({ username });
      const emailCheck = await users.findOne({ email });

      if (usernameCheck) {
        return res.json({ msg: "Username already used", status: false });
      } else if (emailCheck) {
        return res.json({ msg: "email already used", status: false });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await users.create({
          username,
          email,
          password: hashedPassword,
          isVerified,
        });

        const token = jwt.sign({ email }, process.env.JWT_SECRET, {
          expiresIn: "30m",
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });

        const verifyUrl = `http://localhost:5000/auth/verify/${token}`;
        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Email verification",
          html: `<!-- © 2018 Shift Technologies. All rights reserved. -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
                <tbody>
                  <tr>
                    <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperWebview" style="max-width:600px">
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tbody>
                                  <tr>
                                    <td style="padding-top: 20px; padding-bottom: 20px; padding-right: 0px;" align="right" valign="middle" class="webview"> <a href="#" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:right;text-decoration:underline;padding:0;margin:0" target="_blank" class="text hideOnMobile">Oh wait, there's more! →</a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                <tbody>
                                  <tr>
                                    <td style="background-color:#00d2f4;font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td style="padding-top: 60px; padding-bottom: 20px;" align="center" valign="middle" class="emailLogo">
                                      <a href="#" style="text-decoration:none" target="_blank">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/logo.png" style="width:100%;max-width:150px;height:auto;display:block" width="150">
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 20px;" align="center" valign="top" class="imgHero">
                                      <a href="#" style="text-decoration:none" target="_blank">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/heroGradient/user-account.png" style="width:100%;max-width:600px;height:auto;display:block;color: #f9f9f9;" width="600">
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                                      <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi "John Doe"</h2>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                                      <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">Verify Your Email Account</h4>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                        <tbody>
                                          <tr>
                                            <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                              <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Thanks for subscribe for the Vespro newsletter. Please click confirm button for subscription to start receiving our emails.</p>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
                                        <tbody>
                                          <tr>
                                            <td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
                                              <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                <tbody>
                                                  <tr>
                                                    <td style="background-color: rgb(0, 210, 244); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href="${verifyUrl}" style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block" target="_blank" class="text">Confirm Email</a>
                                                    </td>
                                                  </tr>
                                                </tbody>
                                              </table>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                  </tr>
                                  <tr>
                                    <td align="center" valign="middle" style="padding-bottom: 40px;" class="emailRegards">
                                      <!-- Image and Link // -->
                                      <a href="#" target="_blank" style="text-decoration:none;">
                                        <img mc:edit="signature" src="http://email.aumfusion.com/vespro/img//other/signature.png" alt="" width="150" border="0" style="width:100%;
                  max-width:150px; height:auto; display:block;">
                                      </a>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                <tbody>
                                  <tr>
                                    <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                        <tbody>
                          <tr>
                            <td align="center" valign="top">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                <tbody>
                                  <tr>
                                    <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
                                      <a href="#facebook-link" style="display:inline-block" target="_blank" class="facebook">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                      </a>
                                      <a href="#twitter-link" style="display: inline-block;" target="_blank" class="twitter">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/twitter.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                      </a>
                                      <a href="#pintrest-link" style="display: inline-block;" target="_blank" class="pintrest">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/pintrest.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                      </a>
                                      <a href="#instagram-link" style="display: inline-block;" target="_blank" class="instagram">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                      </a>
                                      <a href="#linkdin-link" style="display: inline-block;" target="_blank" class="linkdin">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/linkdin.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                                      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Vespro Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
                                      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
                                      </p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                                      <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
                                        <br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="appLinks">
                                      <a href="#Play-Store-Link" style="display: inline-block;" target="_blank" class="play-store">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/play-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                      </a>
                                      <a href="#App-Store-Link" style="display: inline-block;" target="_blank" class="app-store">
                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/app-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                      </a>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error in sending email  " + error);
          } else {
            console.log("Email sent" + info.response);
          }
        });

        return res.json({
          status: true,
          user,
          msg: "Email sent successfully, please check your email",
          token: token,
        });
      }
    } catch (err) {
      return res.status(500).json({msg: error.message})
    }
  }

  async verifyUser(req, res, next) {
    const token = req.params.token;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const email = decoded.email;

      await users.findOneAndUpdate({ email }, { isVerified: true });

      res.redirect("http://localhost:3000/login");
    } catch (err) {
      return res.status(500).json({msg: err.message})
    }
  }

  async sendMessage(req, res, next) {
    const { email } = req.body;

    try {
      const user = await users.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ msg: "User does not exist in the system", status: false });
      } else {
        const email = user.email;

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "30m",
        });

        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD,
          },
        });

        const resetUrl = `http://localhost:3000/reset-password/${token}`;

        const mailOptions = {
          from: process.env.EMAIL,
          to: email,
          subject: "Email verification",
          html: `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
                        <tbody>
                            <tr>
                                <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperWebview" style="max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td align="center" valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-top: 20px; padding-bottom: 20px; padding-right: 0px;" align="right" valign="middle" class="webview"> <a href="#" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:right;text-decoration:underline;padding:0;margin:0" target="_blank" class="text hideOnMobile">Oh wait, there's more! →</a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td align="center" valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                                                        <tbody>
                                                            <tr>
                                                                <td style="background-color:#00d2f4;font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-top: 60px; padding-bottom: 20px;" align="center" valign="middle" class="emailLogo">
                                                                    <a href="#" style="text-decoration:none" target="_blank">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/logo.png" style="width:100%;max-width:150px;height:auto;display:block" width="150">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-bottom: 20px;" align="center" valign="top" class="imgHero">
                                                                    <a href="#" style="text-decoration:none" target="_blank">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/hero-img/blue/heroGradient/user-account.png" style="width:100%;max-width:600px;height:auto;display:block;color: #f9f9f9;" width="600">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                                                                    <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi ${user.username}</h2>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                                                                    <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">Verify Your Email Account</h4>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                                                                    <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Thanks for subscribe for the Vespro newsletter. Please click confirm button for subscription to start receiving our emails.</p>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
                                                                                    <table border="0" cellpadding="0" cellspacing="0" align="center">
                                                                                        <tbody>
                                                                                            <tr>
                                                                                                <td style="background-color: rgb(0, 210, 244); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href=${resetUrl} style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block" target="_blank" class="text">Confirm Email</a>
                                                                                                </td>
                                                                                            </tr>
                                                                                        </tbody>
                                                                                    </table>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center" valign="middle" style="padding-bottom: 40px;" class="emailRegards">
                                                                    <!-- Image and Link // -->
                                                                    <a href="#" target="_blank" style="text-decoration:none;">
                                                                        <img mc:edit="signature" src="http://email.aumfusion.com/vespro/img//other/signature.png" alt="" width="150" border="0" style="width:100%;
                        max-width:150px; height:auto; display:block;">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                                                        <tbody>
                                                            <tr>
                                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                                        <tbody>
                                            <tr>
                                                <td align="center" valign="top">
                                                    <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                                                        <tbody>
                                                            <tr>
                                                                <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="socialLinks">
                                                                    <a href="#facebook-link" style="display:inline-block" target="_blank" class="facebook">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/facebook.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                                    </a>
                                                                    <a href="#twitter-link" style="display: inline-block;" target="_blank" class="twitter">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/twitter.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                                    </a>
                                                                    <a href="#pintrest-link" style="display: inline-block;" target="_blank" class="pintrest">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/pintrest.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                                    </a>
                                                                    <a href="#instagram-link" style="display: inline-block;" target="_blank" class="instagram">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/instagram.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                                    </a>
                                                                    <a href="#linkdin-link" style="display: inline-block;" target="_blank" class="linkdin">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/social/light/linkdin.png" style="height:auto;width:100%;max-width:40px;margin-left:2px;margin-right:2px" width="40">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding: 10px 10px 5px;" align="center" valign="top" class="brandInfo">
                                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">©&nbsp;Vespro Inc. | 800 Broadway, Suite 1500 | New York, NY 000123, USA.</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding: 0px 10px 20px;" align="center" valign="top" class="footerLinks">
                                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0"> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">View Web Version </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Email Preferences </a>&nbsp;|&nbsp; <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Privacy Policy</a>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                                                                    <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">If you have any quetions please contact us <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">support@mail.com.</a>
                                                                        <br> <a href="#" style="color:#bbb;text-decoration:underline" target="_blank">Unsubscribe</a> from our mailing lists</p>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="padding-top:10px;padding-bottom:10px;padding-left:10px;padding-right:10px" align="center" valign="top" class="appLinks">
                                                                    <a href="#Play-Store-Link" style="display: inline-block;" target="_blank" class="play-store">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/play-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                                                    </a>
                                                                    <a href="#App-Store-Link" style="display: inline-block;" target="_blank" class="app-store">
                                                                        <img alt="" border="0" src="http://email.aumfusion.com/vespro/img/app/app-store.png" style="height:auto;margin:5px;width:100%;max-width:120px" width="120">
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="font-size:1px;line-height:1px" height="30">&nbsp;</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log("Error in sending email  " + error);
            return res
              .status(500)
              .json({ message: "Error in sending email", status: false });
          } else {
            return res
              .status(200)
              .json({
                message: "Email sent successfully, please check your email",
                token: token,
                status: true,
              });
          }
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: error.message});
    }
  }

  async ResetPassword(req, res, next) {
    const { password } = req.body;
    const token = req.params.token;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      const user = await users.findById({ _id: userId });

      if (!user) {
        return res
          .status(404)
          .json({ message: "User does not exist in the system" });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;

      await user.save();

      return res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

module.exports = new Controller();
