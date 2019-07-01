<?php
        $name = $_POST["name"];
				
        $email = $_POST["email"];
        $message = $_POST["message"];
        // Set the recipient email address.
        $recipient = "xjy1998@hotmail.com";

        // Set the email subject.
        $subject = "New contact from $name";

        // Build the email content.
        $email_content = "Name: $name\n";
        $email_content .= "Email: $email\n\n";
        $email_content .= "Message:\n$message\n";

        // Build the email headers.
        $email_headers = "From: $name <$email>";

        // Send the email.
        mail($recipient, $subject, $email_content, $email_headers);

?>