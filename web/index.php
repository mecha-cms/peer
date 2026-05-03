<?php

$hub = 'http://127.0.0.1/test/hub';
$sub = '/peer/web';

?>
<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Loading…</title>
    <link href="https://fonts.googleapis.com" rel="preconnect">
    <link crossorigin href="https://fonts.gstatic.com" rel="preconnect">
    <link href="https://fonts.googleapis.com/css2?display=swap&family=Noto+Color+Emoji" rel="stylesheet">
    <link href="<?= $sub; ?>/index.css" rel="stylesheet">
  </head>
  <body>
    <div role="application">
      <p role="status">Loading…</p>
    </div>
    <script>
      const hub = '<?= $hub; ?>';
      const sub = '<?= $sub; ?>';
    </script>
    <script src="<?= $sub; ?>/index.js"></script>
  </body>
</html>