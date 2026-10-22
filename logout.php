<?php
require_once __DIR__ . '/config/auth.php';
logout_user();
set_flash('info', 'Sesion finalizada', 'Ha cerrado sesion de manera segura.');
header('Location: login.php');
exit;
