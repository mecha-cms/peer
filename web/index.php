<?php

$hub = 'http://127.0.0.1/test/hub';
$sub = '/peer/web';

?>
<!DOCTYPE html>
<html dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>Loading…</title>
    <link href="<?= $sub; ?>/index.css" rel="stylesheet">
    <link href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAAA1BMVEW15h0PzTmSAAAAC0lEQVQI12MgEQAAADAAAWV61nwAAAAASUVORK5CYII=" rel="icon">
  </head>
  <body spellcheck="false">
    <div role="application"></div>
    <script>
      const hub = '<?= $hub; ?>';
      const sub = '<?= $sub; ?>';
    </script>
    <script src="<?= $sub; ?>/index.js"></script>
  </body>
</html>