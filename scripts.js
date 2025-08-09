fetch('content.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(data => {
    const navbar = document.getElementById('navbar');
    data.nav.forEach(item => {
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.text;
      navbar.appendChild(link);
    });

    const content = document.getElementById('content');
    data.sections.forEach(section => {
      const sec = document.createElement('section');
      const h2 = document.createElement('h2');
      h2.textContent = section.title;
      const p = document.createElement('p');
      p.textContent = section.text;
      sec.appendChild(h2);
      sec.appendChild(p);
      content.appendChild(sec);
    });
  })
  .catch(error => {
    document.getElementById('content').innerHTML =
      '<p style="color:red;">Site content failed to load. Please ensure content.json exists and is valid JSON.</p>';
    console.error('Error loading content:', error);
  });