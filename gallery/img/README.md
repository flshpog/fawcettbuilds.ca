# Project photos

Drop job photos in this folder, then list them in `SITE.projects`
at the top of `/assets/site.js`.

    projects: [
      { src: '/gallery/img/panel-01.jpg',
        title: '200A service upgrade',
        category: 'electrical',              // electrical | carpentry | construction
        alt: 'New 200 amp panel with labelled breakers' }
    ]

Notes

- The category filter buttons build themselves from whatever categories
  you use, so you do not have to edit anything else.
- While `projects` is empty, the gallery shows an honest "no photos yet"
  message instead of placeholder tiles. Add one entry and the grid,
  the filters and the lightbox all switch on automatically.
- The home page shows the first 6 and links here for the rest.
- Resize photos to roughly 1600px on the long edge and save as JPG
  (aim for under ~300KB each) so the page stays quick on a phone.
- `alt` describes the picture for screen readers and for Google. Write
  what is actually in the shot.
