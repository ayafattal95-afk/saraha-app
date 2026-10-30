# NGL APP [anonymous-messaging-app]
* send anonymous messages or public messages.
* view profile with related messages.
* handle manage messages.


- tech stack:
    - express
    - javascript 
    - mongodb/mongoose
    - redis [caching]
    - nodemailer [email]
    - jwt [ authentication]
    - bcrypt [password hash]
    - oauth2 [google]
    - validation [Zod,joi,Yup,class-validator]
    - error handling [AppError]
    - rate limiting. [nginx]
    - load balancer. [nginx]

- OTP:
    - delete OTP after 10 min.
    - delete OTP after usage.
    - store OTP temporarily:[time to live]
         - database using mongodb support TTL.[HDD]
         - into cache redis support TTL.[ram] x50 faster more DB.56y65y 
- TODO:
    -  link:
       - verify email:
         - /api/v1/auth/verify-email/:token
       - login:
         - /api/v1/auth/login

- features:
  - authentication flow:
     - register.
     - verify email using OTP.
     - login.
     - reset password.
     - send OTP.
     - login with Google.
     - logout.
  - message flow:
     - send a message. [anonymous - public]
     - view message.
     - delete message. [soft-delete/archive]
  - user flow [me]:
     - view profile.[me]
     - edit profile.[me]
     - delete profile.[me]
  - guards:
     - authentication.[token]


* todo session 1:

- register.
- send email [nodemailer]
- generate OTP.

=================================

* todo Session 2:

- refactor send email.
- login and pass token using cookie.
- verify an account switch isVerified to true.
- resend otp.[in-case otp expired, in-case reset password]
- reset password.

=================================

* todo Session 3:
- customize app error.
- intro to Dependency inversion principle . [class] SOLID >> functions
- reset password.

=================================

* todo Session 4:
- validation using Zod.

=================================

* todo Session 5:
- social login using Google.
    - get idToken from FE.
    - verify idToken. ask Google
    - get payload from IdToken. {id, name, pp, email, dob, phone}
    - if user exist >> generate token.
    - if user not exist >> create user >> generate token.

=================================

* todo Session 6:
  
1. refactor code structure.
      - lib: common functions which related to my app [ngl].
      - pkg: common packages which related to any app [base-code].
      - express - bcrypt - jsonwebtoken >> ngl
2. caching.
      - mandatory features
      - reduce latency. FE <-> BE <-> DB.
      - avid frequent DB queries
      - hash-map. [key-value]
      - mandatory to apply to invalidate cache. [Create, update, delete]
3. custom config.
4. withCache middleware. [intercept]
5. idempotency.
6. correlationId.
7. mailJet.

=================================

* todo Session 7:
1. correlationId.
2. idempotency.
3. mailJet.
4. send message [anonymous - public]
5. auth guard with cookies.

=================================

* todo Session 8:
1. how to upload files. 
2. how to validate files. [filefilter]
3. busboy VS multer.
4. magic numbers validations. [validate on file content]
5. upload profile picture API. [save url/path to DB]

=================================

* todo Session 9:
1. concept of clustering.
2. deploy DB on real server.
3. load balancer
4. apply rate-liming [Network-application]
5. deploy DE on real server.

=================================

* todo Session 10:


