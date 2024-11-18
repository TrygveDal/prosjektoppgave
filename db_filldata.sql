

INSERT INTO `Articles`(`views`) VALUES (0), (0), (0), (0), (0);

INSERT INTO `Versions`(`article_id`, `title`, `content`, `author`, `version_type`, `edit_time`, `is_newest_version`) VALUES 
(1, "Artikkel 1", "Denne artikkelen inneholder informasjon om temaet til artikkel 1", "Svein Rør", "created", 1731267880758, 1), 
(2, "Artikkel 2", "Denne artikkelen inneholder informasjon om temaet til artikkel 2", "Anne Katt", "created", 1731271764448, 1), 
(3, "Artikkel 3", "Denne artikkelen inneholder informasjon om temaet til artikkel 3", "Kjell Loke", "created", 1731583060710, 1), 
(4, "Artikkel 4", "Denne artikkelen inneholder informasjon om temaet til artikkel 4", "Ruben", "created", 1731852603894, 1), 
(5, "Artikkel 5", "Denne artikkelen inneholder informasjon om temaet til artikkel 5", "Kari", "created", 1731588360250, 1);

INSERT INTO `Tags`(id, tag) VALUES
(1, '2024'),
(2, 'Sommer'),
(3, 'Vitenskap');

INSERT INTO `Articles_Tags` (tag_id, article_id) VALUES 
(1, 3),
(1, 2),
(2, 4),
(3, 3),
(1, 4),
(3, 1);

INSERT INTO `Comments` (`article_id`,`user`,`content`) VALUES 
(1,"Ruben","Bra artikkel, godt skrevet"),
(2,"Tuben","Bra artikkel, godt skrevet"),
(3,"Nooben","Bra artikkel, godt skrevet"),
(4,"Kuben","Bra artikkel, godt skrevet"),
(2,"Spindrift","Dette var definitivt en artikkel om 2"),
(1,"Bruker2","Hvorfor kunne jeg ikke lært om dette på skolen?"),
(5,"Kari","Det beste jeg noensinne har lest"),
(5,"Bille","Jeg er uenig i innholdet.");