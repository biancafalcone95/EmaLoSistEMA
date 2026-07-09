<?php
/* Gestione invio form contatti – Ema Lo Sistema
   Invia le richieste a info@emalosistema.it tramite la posta del server Aruba. */

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Metodo non consentito']);
  exit;
}

/* Honeypot anti-spam: se il campo nascosto è compilato, è un bot */
if (!empty($_POST['website'])) {
  echo json_encode(['ok' => true]);
  exit;
}

function field($k) {
  return trim(str_replace(["\r", "\n"], ' ', $_POST[$k] ?? ''));
}

$nome      = field('nome');
$cognome   = field('cognome');
$telefono  = field('telefono');
$email     = field('email');
$servizio  = field('servizio');
$messaggio = trim($_POST['messaggio'] ?? '');

if ($nome === '' || $cognome === '' || $email === '') {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Compila tutti i campi obbligatori.']);
  exit;
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(422);
  echo json_encode(['ok' => false, 'error' => 'Indirizzo email non valido.']);
  exit;
}

$to      = 'info@emalosistema.it';
$subject = "Richiesta dal sito - $nome $cognome";

$body  = "Nuova richiesta dal sito Ema Lo Sistema\n\n";
$body .= "Nome: $nome $cognome\n";
$body .= "Telefono: $telefono\n";
$body .= "Email: $email\n";
$body .= 'Servizio: ' . ($servizio !== '' ? $servizio : 'Non specificato') . "\n\n";
$body .= "Messaggio:\n" . ($messaggio !== '' ? $messaggio : '(nessun messaggio)') . "\n";

$subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$fromName   = '=?UTF-8?B?' . base64_encode('Sito Ema Lo Sistema') . '?=';

/* Allegato opzionale */
$hasFile = isset($_FILES['allegato']) && $_FILES['allegato']['error'] === UPLOAD_ERR_OK && $_FILES['allegato']['size'] > 0;
if ($hasFile) {
  $ext = strtolower(pathinfo($_FILES['allegato']['name'], PATHINFO_EXTENSION));
  if (!in_array($ext, ['pdf', 'jpg', 'jpeg', 'png'], true)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Formato allegato non ammesso (solo PDF, JPG, PNG).']);
    exit;
  }
  if ($_FILES['allegato']['size'] > 5 * 1024 * 1024) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'L\'allegato supera i 5 MB.']);
    exit;
  }
}

if ($hasFile) {
  $filename = preg_replace('/[^A-Za-z0-9._-]/', '_', $_FILES['allegato']['name']);
  $data     = chunk_split(base64_encode(file_get_contents($_FILES['allegato']['tmp_name'])));
  $boundary = 'b_' . md5(uniqid('', true));

  $headers  = "From: $fromName <info@emalosistema.it>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: multipart/mixed; boundary=\"$boundary\"\r\n";

  $msg  = "--$boundary\r\n";
  $msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
  $msg .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
  $msg .= $body . "\r\n";
  $msg .= "--$boundary\r\n";
  $msg .= "Content-Type: application/octet-stream; name=\"$filename\"\r\n";
  $msg .= "Content-Transfer-Encoding: base64\r\n";
  $msg .= "Content-Disposition: attachment; filename=\"$filename\"\r\n\r\n";
  $msg .= $data . "\r\n";
  $msg .= "--$boundary--";

  $sent = @mail($to, $subjectEnc, $msg, $headers);
} else {
  $headers  = "From: $fromName <info@emalosistema.it>\r\n";
  $headers .= "Reply-To: $email\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

  $sent = @mail($to, $subjectEnc, $body, $headers);
}

if ($sent) {
  echo json_encode(['ok' => true]);
} else {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Invio non riuscito. Riprova o chiamaci al +39 392 862 3005.']);
}
