import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your preferred email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD, // Use an app password for Gmail
  },
});

// Email template for verification code
export const sendVerificationEmail = async (email: string, verificationCode: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Use no-reply address as per user preference
    to: email,
    subject: 'ელ-ფოსტის ვერიფიკაცია - Scool პლატფორმა',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">ელ-ფოსტის ვერიფიკაცია</h2>
        <p>გმადლობთ Scool პლატფორმაზე რეგისტრაციისთვის!</p>
        <p>თქვენი ვერიფიკაციის კოდია:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${verificationCode}</h1>
        </div>
        <p>გთხოვთ შეიყვანოთ ეს კოდი რეგისტრაციის დასასრულებლად.</p>
        <p>ეს კოდი ვადა გასდება 10 წუთში.</p>
        <p>თუ თქვენ არ მოითხოვეთ ეს ვერიფიკაცია, გთხოვთ უგულებელყოთ ეს ელ-ფოსტა.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          ეს არის ავტომატური შეტყობინება Scool პლატფორმიდან. გთხოვთ არ უპასუხოთ ამ ელ-ფოსტას.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'ვერიფიკაციის ელ-ფოსტის გაგზავნა ვერ მოხერხდა' };
  }
};

// Email template for successful verification
export const sendVerificationSuccessEmail = async (email: string, name: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ელ-ფოსტა წარმატებით გადამოწმდა - Scool პლატფორმა',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745; text-align: center;">ელ-ფოსტა წარმატებით გადამოწმდა!</h2>
        <p>გამარჯობა ${name},</p>
        <p>თქვენი ელ-ფოსტა წარმატებით გადამოწმდა. ახლა შეგიძლიათ დაასრულოთ რეგისტრაცია Scool პლატფორმაზე.</p>
        <p>კეთილი იყოს თქვენი მობრძანება ჩვენს საზოგადოებაში!</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 12px; text-align: center;">
          ეს არის ავტომატური შეტყობინება Scool პლატფორმიდან. გთხოვთ არ უპასუხოთ ამ ელ-ფოსტას.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: 'წარმატების ელ-ფოსტის გაგზავნა ვერ მოხერხდა' };
  }
};
