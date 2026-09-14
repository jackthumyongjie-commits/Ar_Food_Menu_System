import * as THREE from 'three';

(function (global) {
    function createMaterial(THREE, color, extras) {
        return new THREE.MeshStandardMaterial(Object.assign({
            color: color,
            roughness: 0.72,
            metalness: 0.04
        }, extras || {}));
    }

    function addSeed(THREE, parent, mat, x, y, z) {
        var seed = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), mat);
        seed.position.set(x, y, z);
        seed.scale.set(1, 0.45, 1.35);
        parent.add(seed);
    }

    function createBurger(THREE) {
        var group = new THREE.Group();
        var bun = createMaterial(THREE, 0xe0a050);
        var bunDark = createMaterial(THREE, 0xc48940, { roughness: 0.8 });
        var patty = createMaterial(THREE, 0x3b2214, { roughness: 0.92 });
        var cheese = createMaterial(THREE, 0xffc93a, { roughness: 0.38, metalness: 0.08 });
        var lettuce = createMaterial(THREE, 0x4caf50, { side: THREE.DoubleSide, roughness: 0.84 });
        var tomato = createMaterial(THREE, 0xd32f2f, { roughness: 0.55 });
        var onion = createMaterial(THREE, 0xd9b8d9, { roughness: 0.5 });
        var seed = createMaterial(THREE, 0xf7f1de, { roughness: 0.48 });

        var bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.68, 0.28, 48), bun);
        bottom.position.y = 0.2;
        group.add(bottom);

        var pattyMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.73, 0.2, 32), patty);
        pattyMesh.position.y = 0.43;
        group.add(pattyMesh);

        var cheeseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.045, 1.38), cheese);
        cheeseMesh.position.y = 0.55;
        cheeseMesh.rotation.y = Math.PI / 9;
        group.add(cheeseMesh);

        var lettuceMesh = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.13, 8, 18), lettuce);
        lettuceMesh.position.y = 0.62;
        lettuceMesh.rotation.x = Math.PI / 2;
        lettuceMesh.scale.set(1.12, 1.12, 0.38);
        group.add(lettuceMesh);

        var tomatoA = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 24), tomato);
        tomatoA.position.set(-0.22, 0.7, 0.08);
        var tomatoB = tomatoA.clone();
        tomatoB.position.set(0.24, 0.7, -0.04);
        group.add(tomatoA);
        group.add(tomatoB);

        var onionA = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 20), onion);
        onionA.position.set(0.02, 0.76, 0.12);
        onionA.rotation.x = Math.PI / 2.4;
        var onionB = onionA.clone();
        onionB.position.set(-0.1, 0.77, -0.16);
        onionB.rotation.z = 0.4;
        group.add(onionA);
        group.add(onionB);

        var bacon = createMaterial(THREE, 0xa33a2a, { roughness: 0.7 });
        for (var b = 0; b < 2; b += 1) {
            var strip = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.04, 0.22), bacon);
            strip.position.set(0.05, 0.8 + b * 0.05, -0.05 + b * 0.08);
            strip.rotation.y = 0.2 - b * 0.35;
            strip.rotation.z = 0.08 * (b ? -1 : 1);
            group.add(strip);
        }

        var rim = new THREE.Mesh(new THREE.CylinderGeometry(0.73, 0.73, 0.1, 48), bunDark);
        rim.position.y = 0.92;
        group.add(rim);

        var top = new THREE.Mesh(
            new THREE.SphereGeometry(0.73, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2),
            bun
        );
        top.position.y = 0.96;
        top.scale.set(1, 0.7, 1);
        group.add(top);

        addSeed(THREE, group, seed, 0.08, 1.36, 0.18);
        addSeed(THREE, group, seed, -0.22, 1.32, 0.08);
        addSeed(THREE, group, seed, 0.28, 1.3, -0.12);
        addSeed(THREE, group, seed, -0.06, 1.38, -0.22);
        addSeed(THREE, group, seed, 0.18, 1.26, 0.32);
        addSeed(THREE, group, seed, -0.32, 1.24, -0.18);
        addSeed(THREE, group, seed, 0.02, 1.4, 0.02);

        return group;
    }

    function createPizza(THREE) {
        var group = new THREE.Group();
        var crust = createMaterial(THREE, 0xc47a3a, { roughness: 0.82 });
        var sauce = createMaterial(THREE, 0xb33a2b, { roughness: 0.7 });
        var cheese = createMaterial(THREE, 0xf2d35b, { roughness: 0.52 });
        var pepperoni = createMaterial(THREE, 0x8b1e1e, { roughness: 0.6 });
        var olive = createMaterial(THREE, 0x1a1a1a, { roughness: 0.45 });
        var basil = createMaterial(THREE, 0x3d8b3d, { side: THREE.DoubleSide, roughness: 0.8 });

        var base = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.08, 0.09, 48), crust);
        base.position.y = 0.045;
        group.add(base);

        var rim = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.11, 10, 40), crust);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.09;
        group.add(rim);

        var sauceMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.92, 0.024, 40), sauce);
        sauceMesh.position.y = 0.1;
        group.add(sauceMesh);

        var cheeseMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.03, 40), cheese);
        cheeseMesh.position.y = 0.12;
        group.add(cheeseMesh);

        var pepGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.028, 16);
        [
            [0.35, 0.14, 0.1], [-0.28, 0.14, 0.22], [0.08, 0.14, -0.38],
            [-0.4, 0.14, -0.15], [0.42, 0.14, -0.25], [-0.05, 0.14, 0.38],
            [0.18, 0.14, 0.32], [-0.22, 0.14, -0.35]
        ].forEach(function (p) {
            var slice = new THREE.Mesh(pepGeo, pepperoni);
            slice.position.set(p[0], p[1], p[2]);
            group.add(slice);
        });

        var oliveGeo = new THREE.TorusGeometry(0.055, 0.022, 8, 12);
        [
            [0.12, 0.15, 0.08], [-0.15, 0.15, -0.1],
            [0.3, 0.15, 0.28], [-0.32, 0.15, 0.05]
        ].forEach(function (p) {
            var ring = new THREE.Mesh(oliveGeo, olive);
            ring.position.set(p[0], p[1], p[2]);
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
        });

        var leafGeo = new THREE.SphereGeometry(0.08, 8, 6);
        [
            [0.02, 0.16, -0.18], [-0.2, 0.16, 0.12], [0.24, 0.16, -0.06]
        ].forEach(function (p) {
            var leaf = new THREE.Mesh(leafGeo, basil);
            leaf.position.set(p[0], p[1], p[2]);
            leaf.scale.set(1.4, 0.18, 0.7);
            leaf.rotation.y = p[0];
            group.add(leaf);
        });

        return group;
    }

    function createPasta(THREE) {
        var group = new THREE.Group();
        var bowl = createMaterial(THREE, 0x6b3a1f, { roughness: 0.55 });
        var inner = createMaterial(THREE, 0xd9b48c, { roughness: 0.42 });
        var cream = createMaterial(THREE, 0xf3e4c4, { roughness: 0.5 });
        var noodle = createMaterial(THREE, 0xe8c36a, { roughness: 0.62 });
        var herb = createMaterial(THREE, 0x4a7c32, { roughness: 0.8 });
        var tomato = createMaterial(THREE, 0xc4452d, { roughness: 0.55 });

        var outer = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.55, 0.42, 32), bowl);
        outer.position.y = 0.21;
        group.add(outer);

        var lining = new THREE.Mesh(new THREE.CylinderGeometry(0.86, 0.48, 0.36, 32), inner);
        lining.position.y = 0.24;
        group.add(lining);

        var sauce = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.78, 0.1, 24), cream);
        sauce.position.y = 0.4;
        group.add(sauce);

        var noodleGeo = new THREE.TorusGeometry(0.26, 0.045, 8, 20);
        for (var i = 0; i < 10; i += 1) {
            var strand = new THREE.Mesh(noodleGeo, noodle);
            strand.position.set(
                (i % 3 - 1) * 0.16,
                0.46 + (i % 4) * 0.035,
                (Math.floor(i / 3) - 1) * 0.14
            );
            strand.rotation.set(0.4 + i * 0.2, i * 0.7, 0.3 + i * 0.15);
            strand.scale.set(0.7 + (i % 3) * 0.12, 1, 0.7);
            group.add(strand);
        }

        var tomatoGeo = new THREE.SphereGeometry(0.08, 10, 8);
        [[0.22, 0.52, 0.08], [-0.18, 0.5, -0.12], [0.05, 0.54, 0.2]].forEach(function (p) {
            var cherry = new THREE.Mesh(tomatoGeo, tomato);
            cherry.position.set(p[0], p[1], p[2]);
            cherry.scale.set(1, 0.8, 1);
            group.add(cherry);
        });

        var flakeGeo = new THREE.SphereGeometry(0.03, 6, 6);
        for (var h = 0; h < 8; h += 1) {
            var flake = new THREE.Mesh(flakeGeo, herb);
            flake.position.set(Math.cos(h) * 0.28, 0.53, Math.sin(h * 1.4) * 0.22);
            flake.scale.set(1.2, 0.25, 0.7);
            group.add(flake);
        }

        return group;
    }

    function createFriedPlatter(THREE) {
        var group = new THREE.Group();
        var plate = createMaterial(THREE, 0x2a2a2a, { roughness: 0.35, metalness: 0.2 });
        var crust = createMaterial(THREE, 0xd4a04a, { roughness: 0.78 });
        var potato = createMaterial(THREE, 0xe8b65c, { roughness: 0.7 });
        var skin = createMaterial(THREE, 0xb8843c, { roughness: 0.82 });
        var lemon = createMaterial(THREE, 0xf0d44a, { roughness: 0.55 });
        var lemonIn = createMaterial(THREE, 0xfff3a8, { roughness: 0.6 });

        var plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.05, 0.08, 40), plate);
        plateMesh.position.y = 0.04;
        group.add(plateMesh);

        [
            [-0.35, 0.22, 0.1, 0.4],
            [-0.05, 0.24, -0.2, -0.3],
            [0.28, 0.2, 0.05, 0.8]
        ].forEach(function (p) {
            var nugget = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.22, 0.28), crust);
            nugget.position.set(p[0], p[1], p[2]);
            nugget.rotation.y = p[3];
            nugget.scale.set(1, 1, 0.9 + (p[0] + 1) * 0.05);
            group.add(nugget);
        });

        for (var i = 0; i < 6; i += 1) {
            var wedge = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.38), i % 2 ? skin : potato);
            wedge.position.set(0.15 + (i % 3) * 0.16, 0.16, -0.35 + Math.floor(i / 3) * 0.2);
            wedge.rotation.y = 0.3 + i * 0.25;
            wedge.rotation.z = 0.15;
            group.add(wedge);
        }

        var lemonOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.05, 24), lemon);
        lemonOuter.position.set(-0.55, 0.12, -0.35);
        lemonOuter.rotation.x = Math.PI / 2.5;
        group.add(lemonOuter);
        var lemonInner = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.052, 24), lemonIn);
        lemonInner.position.copy(lemonOuter.position);
        lemonInner.position.y += 0.01;
        lemonInner.rotation.copy(lemonOuter.rotation);
        group.add(lemonInner);

        return group;
    }

    function createKebab(THREE) {
        var group = new THREE.Group();
        var meat = createMaterial(THREE, 0x6b3418, { roughness: 0.85 });
        var char = createMaterial(THREE, 0x3a1e10, { roughness: 0.9 });
        var stick = createMaterial(THREE, 0xc9a06a, { roughness: 0.65 });
        var chili = createMaterial(THREE, 0xc62828, { roughness: 0.55 });
        var herb = createMaterial(THREE, 0x3d8b3d, { roughness: 0.8 });
        var board = createMaterial(THREE, 0x1a1a1a, { roughness: 0.5 });

        var boardMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 0.9), board);
        boardMesh.position.y = 0.03;
        group.add(boardMesh);

        for (var k = 0; k < 3; k += 1) {
            var skewer = new THREE.Group();
            skewer.position.set(-0.45 + k * 0.45, 0.18, 0);
            skewer.rotation.z = -0.08 + k * 0.05;
            skewer.rotation.y = 0.1 - k * 0.05;

            var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), stick);
            rod.rotation.z = Math.PI / 2;
            skewer.add(rod);

            for (var m = 0; m < 4; m += 1) {
                var chunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.13, 0.12, 0.28, 12),
                    m % 2 ? char : meat
                );
                chunk.rotation.z = Math.PI / 2;
                chunk.position.x = -0.42 + m * 0.28;
                chunk.scale.set(1, 1.05, 0.95);
                skewer.add(chunk);
            }

            var chiliMesh = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), chili);
            chiliMesh.position.set(0.35, 0.12, 0.05);
            chiliMesh.scale.set(0.7, 1.4, 0.7);
            skewer.add(chiliMesh);

            var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), herb);
            leaf.position.set(-0.1, 0.14, -0.08);
            leaf.scale.set(1.5, 0.2, 0.7);
            skewer.add(leaf);

            group.add(skewer);
        }

        return group;
    }

    function createRoast(THREE) {
        var group = new THREE.Group();
        var silver = createMaterial(THREE, 0xb0b0b0, { roughness: 0.28, metalness: 0.65 });
        var meat = createMaterial(THREE, 0x8b3a22, { roughness: 0.75 });
        var cooked = createMaterial(THREE, 0xc45a35, { roughness: 0.7 });
        var onion = createMaterial(THREE, 0xa83228, { roughness: 0.6 });
        var orange = createMaterial(THREE, 0xe67e22, { roughness: 0.55 });
        var herb = createMaterial(THREE, 0x2e7d32, { roughness: 0.8 });
        var berry = createMaterial(THREE, 0xb71c1c, { roughness: 0.5 });

        var platter = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.05, 0.07, 40), silver);
        platter.position.y = 0.035;
        group.add(platter);

        for (var i = 0; i < 5; i += 1) {
            var slice = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.7), i % 2 ? meat : cooked);
            slice.position.set(-0.35 + i * 0.18, 0.14 + i * 0.02, -0.05 + (i % 2) * 0.05);
            slice.rotation.y = 0.2;
            slice.rotation.z = -0.08;
            group.add(slice);
        }

        [[0.55, 0.16, 0.25], [0.4, 0.14, 0.4], [0.65, 0.15, 0.35]].forEach(function (p, idx) {
            var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), onion);
            bulb.position.set(p[0], p[1], p[2]);
            bulb.scale.set(1, 0.85, 1);
            group.add(bulb);
            if (idx === 0) {
                var ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), onion);
                ring.position.set(p[0], p[1] + 0.08, p[2]);
                ring.rotation.x = Math.PI / 2;
                group.add(ring);
            }
        });

        var citrus = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20), orange);
        citrus.position.set(-0.55, 0.12, 0.35);
        citrus.rotation.x = Math.PI / 2.3;
        group.add(citrus);

        for (var h = 0; h < 4; h += 1) {
            var sprig = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 6), herb);
            sprig.position.set(-0.15 + h * 0.12, 0.28, 0.35);
            sprig.scale.set(0.5, 1.8, 0.4);
            sprig.rotation.z = 0.3;
            group.add(sprig);
        }

        [[0.1, 0.22, 0.4], [0.2, 0.2, 0.48]].forEach(function (p) {
            var berryMesh = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), berry);
            berryMesh.position.set(p[0], p[1], p[2]);
            group.add(berryMesh);
        });

        return group;
    }

    function createCoffeeSet(THREE) {
        var group = new THREE.Group();
        var ceramic = createMaterial(THREE, 0xf5f5f5, { roughness: 0.4 });
        var coffee = createMaterial(THREE, 0x2c1810, { roughness: 0.55 });
        var pastry = createMaterial(THREE, 0xd4a05a, { roughness: 0.75 });
        var tray = createMaterial(THREE, 0x8d6e4c, { roughness: 0.7 });
        var cream = createMaterial(THREE, 0xfff8e7, { roughness: 0.5 });

        var trayMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.05, 8), tray);
        trayMesh.position.y = 0.025;
        group.add(trayMesh);

        var cup = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.35, 24), ceramic);
        cup.position.set(-0.35, 0.25, 0.05);
        group.add(cup);
        var liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 20), coffee);
        liquid.position.set(-0.35, 0.38, 0.05);
        group.add(liquid);
        var handle = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16, Math.PI), ceramic);
        handle.position.set(-0.08, 0.25, 0.05);
        handle.rotation.y = Math.PI / 2;
        group.add(handle);

        var saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.38, 0.04, 24), ceramic);
        saucer.position.set(0.35, 0.08, -0.15);
        group.add(saucer);

        for (var c = 0; c < 2; c += 1) {
            var croissant = new THREE.Mesh(
                new THREE.TorusGeometry(0.22, 0.08, 8, 16, Math.PI * 1.2),
                pastry
            );
            croissant.position.set(0.25 + c * 0.18, 0.16, -0.1 + c * 0.12);
            croissant.rotation.x = Math.PI / 2.2;
            croissant.rotation.z = 0.4 + c * 0.5;
            croissant.scale.set(1, 0.7, 1.2);
            group.add(croissant);
        }

        var pitcher = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 0.28, 16), ceramic);
        pitcher.position.set(0.45, 0.22, 0.35);
        group.add(pitcher);
        var milk = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 12), cream);
        milk.position.set(0.45, 0.34, 0.35);
        group.add(milk);

        return group;
    }

    function createSmoothie(THREE) {
        var group = new THREE.Group();
        var glass = createMaterial(THREE, 0xdce9f5, { roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.35 });
        var drink = createMaterial(THREE, 0xe91e63, { roughness: 0.45 });
        var leaf = createMaterial(THREE, 0x1b5e20, { roughness: 0.8 });
        var straw = createMaterial(THREE, 0xffffff, { roughness: 0.5 });

        var tumbler = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.26, 0.95, 24), glass);
        tumbler.position.y = 0.48;
        group.add(tumbler);

        var fill = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.23, 0.75, 24), drink);
        fill.position.y = 0.4;
        group.add(fill);

        var strawMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.1, 8), straw);
        strawMesh.position.set(0.1, 0.75, 0);
        strawMesh.rotation.z = -0.15;
        group.add(strawMesh);

        for (var i = 0; i < 3; i += 1) {
            var mint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), leaf);
            mint.position.set(-0.05 + i * 0.06, 0.95, 0.05);
            mint.scale.set(1.4, 0.2, 0.7);
            mint.rotation.z = -0.4 + i * 0.35;
            mint.rotation.y = i * 0.4;
            group.add(mint);
        }

        return group;
    }

    function createIcedCoffee(THREE) {
        var group = new THREE.Group();
        var glass = createMaterial(THREE, 0xdce9f5, { roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.32 });
        var coffee = createMaterial(THREE, 0x5d4037, { roughness: 0.5 });
        var cream = createMaterial(THREE, 0xfff8e1, { roughness: 0.45 });
        var ice = createMaterial(THREE, 0xe3f2fd, { roughness: 0.15, metalness: 0.05, transparent: true, opacity: 0.55 });

        var tall = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 1.15, 24), glass);
        tall.position.y = 0.58;
        group.add(tall);

        var liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.23, 0.7, 24), coffee);
        liquid.position.y = 0.4;
        group.add(liquid);

        for (var i = 0; i < 4; i += 1) {
            var cube = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.14), ice);
            cube.position.set(
                (i % 2 - 0.5) * 0.16,
                0.55 + Math.floor(i / 2) * 0.14,
                (Math.floor(i / 2) - 0.5) * 0.12
            );
            cube.rotation.y = i * 0.4;
            group.add(cube);
        }

        var swirl = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.08, 10, 20), cream);
        swirl.position.y = 1.05;
        swirl.rotation.x = Math.PI / 2;
        swirl.scale.set(1, 1, 1.4);
        group.add(swirl);

        var peak = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), cream);
        peak.position.y = 1.22;
        peak.scale.set(1, 1.3, 1);
        group.add(peak);

        var dollop = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), cream);
        dollop.position.set(0.08, 1.12, 0.05);
        group.add(dollop);

        return group;
    }

    function createFriedChicken(THREE) {
        var group = new THREE.Group();
        var plate = createMaterial(THREE, 0xf7f7f7, { roughness: 0.35 });
        var crust = createMaterial(THREE, 0xe0a84a, { roughness: 0.82 });
        var dark = createMaterial(THREE, 0xc47a2e, { roughness: 0.78 });
        var bone = createMaterial(THREE, 0xf0e6d8, { roughness: 0.45 });
        var lettuce = createMaterial(THREE, 0x66bb6a, { side: THREE.DoubleSide, roughness: 0.8 });

        var plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.1, 0.08, 40), plate);
        plateMesh.position.y = 0.04;
        group.add(plateMesh);
        var rim = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.045, 8, 36), plate);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = 0.08;
        group.add(rim);

        for (var L = 0; L < 5; L += 1) {
            var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), lettuce);
            leaf.position.set(Math.cos(L * 1.3) * 0.55, 0.12, Math.sin(L * 1.3) * 0.5);
            leaf.scale.set(1.5, 0.15, 0.9);
            leaf.rotation.y = L;
            group.add(leaf);
        }

        function addDrumstick(x, y, z, rotY, rotZ, mat) {
            var piece = new THREE.Group();
            piece.position.set(x, y, z);
            piece.rotation.y = rotY;
            piece.rotation.z = rotZ;

            var meat = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat);
            meat.position.set(0, 0.08, 0);
            meat.scale.set(1.15, 0.95, 0.9);
            piece.add(meat);

            var mid = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.38, 12), mat);
            mid.position.set(0.18, 0.05, 0);
            mid.rotation.z = Math.PI / 2.3;
            piece.add(mid);

            var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.22, 8), bone);
            tip.position.set(0.42, 0.02, 0);
            tip.rotation.z = Math.PI / 2.2;
            piece.add(tip);

            var bump = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), dark);
            bump.position.set(-0.05, 0.16, 0.06);
            bump.scale.set(1.2, 0.7, 1);
            piece.add(bump);

            group.add(piece);
        }

        function addWing(x, y, z, rotY, rotZ, mat) {
            var piece = new THREE.Group();
            piece.position.set(x, y, z);
            piece.rotation.y = rotY;
            piece.rotation.z = rotZ;

            var flat = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.14, 0.26), mat);
            flat.position.set(0, 0.08, 0);
            flat.scale.set(1, 1, 0.85);
            piece.add(flat);

            var joint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), mat);
            joint.position.set(-0.18, 0.1, 0);
            piece.add(joint);

            var tip = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.04, 0.28, 10), mat);
            tip.position.set(0.28, 0.08, 0);
            tip.rotation.z = Math.PI / 2.4;
            piece.add(tip);

            group.add(piece);
        }

        addDrumstick(-0.25, 0.22, 0.1, 0.6, 0.35, crust);
        addDrumstick(0.2, 0.28, -0.05, -0.4, -0.25, dark);
        addDrumstick(-0.05, 0.38, 0.15, 1.2, 0.15, crust);
        addDrumstick(0.15, 0.2, 0.28, -1.0, 0.45, dark);
        addWing(0.35, 0.24, 0.05, 0.3, -0.2, crust);
        addWing(-0.35, 0.26, -0.15, 2.2, 0.3, dark);
        addWing(0.05, 0.48, -0.1, 0.8, 0.1, crust);
        addWing(-0.1, 0.3, -0.3, -0.5, 0.5, dark);

        return group;
    }

    function createSalmonSalad(THREE) {
        var group = new THREE.Group();
        var plate = createMaterial(THREE, 0xf7f7f7, { roughness: 0.35 });
        var salmon = createMaterial(THREE, 0xe07a4f, { roughness: 0.55 });
        var grill = createMaterial(THREE, 0x4e342e, { roughness: 0.85 });
        var green = createMaterial(THREE, 0x4caf50, { side: THREE.DoubleSide, roughness: 0.8 });
        var purple = createMaterial(THREE, 0x7b1fa2, { side: THREE.DoubleSide, roughness: 0.75 });
        var tomato = createMaterial(THREE, 0xd32f2f, { roughness: 0.55 });
        var onion = createMaterial(THREE, 0xce93d8, { roughness: 0.5 });

        var plateMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.1, 0.08, 40), plate);
        plateMesh.position.y = 0.04;
        group.add(plateMesh);

        for (var i = 0; i < 14; i += 1) {
            var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), i % 3 ? green : purple);
            leaf.position.set(
                Math.cos(i * 0.9) * 0.45,
                0.14 + (i % 4) * 0.03,
                Math.sin(i * 1.1) * 0.4
            );
            leaf.scale.set(1.6, 0.15, 0.9);
            leaf.rotation.set(0.4, i * 0.5, 0.3);
            group.add(leaf);
        }

        for (var s = 0; s < 2; s += 1) {
            var fillet = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.32), salmon);
            fillet.position.set(-0.18 + s * 0.38, 0.28, -0.05 + s * 0.08);
            fillet.rotation.y = 0.25 - s * 0.15;
            group.add(fillet);
            for (var g = 0; g < 3; g += 1) {
                var mark = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.015, 0.035), grill);
                mark.position.set(fillet.position.x, 0.345, fillet.position.z - 0.08 + g * 0.08);
                mark.rotation.y = fillet.rotation.y;
                group.add(mark);
            }
        }

        [[0.45, 0.22, 0.25], [-0.4, 0.2, 0.3], [0.1, 0.2, 0.4]].forEach(function (p) {
            var cherry = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), tomato);
            cherry.position.set(p[0], p[1], p[2]);
            group.add(cherry);
        });

        var ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 16), onion);
        ring.position.set(-0.35, 0.22, -0.25);
        ring.rotation.x = Math.PI / 2.3;
        group.add(ring);

        return group;
    }

    function createSkewers(THREE) {
        var group = new THREE.Group();
        var board = createMaterial(THREE, 0x1f1f1f, { roughness: 0.55 });
        var stick = createMaterial(THREE, 0xc9a06a, { roughness: 0.65 });
        var roll = createMaterial(THREE, 0xd4a05a, { roughness: 0.78 });
        var rollDark = createMaterial(THREE, 0xb8843c, { roughness: 0.8 });
        var lettuce = createMaterial(THREE, 0x4caf50, { side: THREE.DoubleSide, roughness: 0.8 });
        var tomato = createMaterial(THREE, 0xd32f2f, { roughness: 0.55 });

        var base = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.06, 1.0), board);
        base.position.y = 0.03;
        group.add(base);

        for (var i = 0; i < 10; i += 1) {
            var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lettuce);
            leaf.position.set(-0.5 + (i % 5) * 0.25, 0.1, -0.25 + Math.floor(i / 5) * 0.35);
            leaf.scale.set(1.4, 0.18, 1);
            leaf.rotation.y = i * 0.4;
            group.add(leaf);
        }

        for (var k = 0; k < 4; k += 1) {
            var skewer = new THREE.Group();
            skewer.position.set(-0.52 + k * 0.34, 0.22, 0.05);
            skewer.rotation.z = 0.08 - k * 0.02;
            skewer.rotation.y = -0.15 + k * 0.05;

            var rod = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.35, 8), stick);
            rod.rotation.z = Math.PI / 2;
            skewer.add(rod);

            for (var m = 0; m < 5; m += 1) {
                var piece = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.11, 0.11, 0.2, 12),
                    m % 2 ? rollDark : roll
                );
                piece.rotation.z = Math.PI / 2;
                piece.position.x = -0.45 + m * 0.22;
                piece.scale.set(1, 1.15, 1);
                skewer.add(piece);
                var ridge = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.015, 6, 12), rollDark);
                ridge.rotation.y = Math.PI / 2;
                ridge.position.x = piece.position.x;
                skewer.add(ridge);
            }

            var cherry = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), tomato);
            cherry.position.set(0.55, 0.05, 0.05);
            skewer.add(cherry);

            group.add(skewer);
        }

        return group;
    }

    function createJuice(THREE) {
        var group = new THREE.Group();
        var glass = createMaterial(THREE, 0xdce9f5, { roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.32 });
        var drink = createMaterial(THREE, 0xf5a623, { roughness: 0.45 });
        var straw = createMaterial(THREE, 0x333333, { roughness: 0.5 });
        var garnish = createMaterial(THREE, 0x2e7d32, { roughness: 0.75 });
        var fruit = createMaterial(THREE, 0xff9800, { roughness: 0.55 });

        var tumbler = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.24, 1.05, 24), glass);
        tumbler.position.y = 0.52;
        group.add(tumbler);

        var fill = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.21, 0.85, 24), drink);
        fill.position.y = 0.45;
        group.add(fill);

        var strawMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.15, 8), straw);
        strawMesh.position.set(0.08, 0.75, 0);
        strawMesh.rotation.z = -0.12;
        group.add(strawMesh);

        var slice = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 16), fruit);
        slice.position.set(-0.22, 0.95, 0.05);
        slice.rotation.z = 0.5;
        slice.rotation.y = 0.3;
        group.add(slice);

        var leaf = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), garnish);
        leaf.position.set(-0.18, 1.05, 0.08);
        leaf.scale.set(1.4, 0.2, 0.7);
        group.add(leaf);

        return group;
    }

    function createWrap(THREE) {
        var group = new THREE.Group();
        var tortilla = createMaterial(THREE, 0xe0b86a, { roughness: 0.75 });
        var grill = createMaterial(THREE, 0x8d6e4c, { roughness: 0.8 });
        var meat = createMaterial(THREE, 0x5d3a1a, { roughness: 0.85 });
        var sauce = createMaterial(THREE, 0xfff3e0, { roughness: 0.5 });
        var veg = createMaterial(THREE, 0x4caf50, { roughness: 0.75 });
        var board = createMaterial(THREE, 0x2a2a2a, { roughness: 0.5 });

        var boardMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.9), board);
        boardMesh.position.y = 0.025;
        group.add(boardMesh);

        var whole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 1.15, 20), tortilla);
        whole.rotation.z = Math.PI / 2;
        whole.position.set(0, 0.28, -0.18);
        whole.rotation.y = 0.15;
        group.add(whole);
        for (var g = 0; g < 4; g += 1) {
            var mark = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.04), grill);
            mark.position.set(0, 0.42, -0.18);
            mark.rotation.y = 0.15;
            mark.position.z += -0.08 + g * 0.05;
            group.add(mark);
        }

        var half = new THREE.Group();
        half.position.set(0.05, 0.3, 0.22);
        half.rotation.y = -0.35;
        half.rotation.z = 0.25;

        var shell = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 20), tortilla);
        shell.rotation.z = Math.PI / 2;
        half.add(shell);

        var fillingMeat = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.55, 12), meat);
        fillingMeat.rotation.z = Math.PI / 2;
        half.add(fillingMeat);

        var fillingSauce = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.5, 10), sauce);
        fillingSauce.rotation.z = Math.PI / 2;
        fillingSauce.position.y = 0.06;
        half.add(fillingSauce);

        var fillingVeg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.48, 10), veg);
        fillingVeg.rotation.z = Math.PI / 2;
        fillingVeg.position.y = -0.05;
        half.add(fillingVeg);

        var cutFace = new THREE.Mesh(new THREE.CircleGeometry(0.2, 20), meat);
        cutFace.position.x = 0.35;
        cutFace.rotation.y = Math.PI / 2;
        half.add(cutFace);

        group.add(half);
        return group;
    }

    global.FoodMenuAR = {
        createBurger: createBurger,
        createPizza: createPizza,
        createPasta: createPasta,
        createFriedPlatter: createFriedPlatter,
        createKebab: createKebab,
        createRoast: createRoast,
        createCoffeeSet: createCoffeeSet,
        createSmoothie: createSmoothie,
        createIcedCoffee: createIcedCoffee,
        createFriedChicken: createFriedChicken,
        createSalmonSalad: createSalmonSalad,
        createSkewers: createSkewers,
        createJuice: createJuice,
        createWrap: createWrap
    };
})(globalThis);

const built = globalThis.FoodMenuAR;

function wrap(builder) {
    return function createModel() {
        return builder(THREE);
    };
}

export const createBurger = wrap(built.createBurger);
export const createPizza = wrap(built.createPizza);
export const createPasta = wrap(built.createPasta);
export const createFriedPlatter = wrap(built.createFriedPlatter);
export const createKebab = wrap(built.createKebab);
export const createRoast = wrap(built.createRoast);
export const createCoffeeSet = wrap(built.createCoffeeSet);
export const createCoffee = createCoffeeSet;
export const createSmoothie = wrap(built.createSmoothie);
export const createIcedCoffee = wrap(built.createIcedCoffee);
export const createFriedChicken = wrap(built.createFriedChicken);
export const createSalmonSalad = wrap(built.createSalmonSalad);
export const createSalad = createSalmonSalad;
export const createSkewers = wrap(built.createSkewers);
export const createJuice = wrap(built.createJuice);
export const createWrap = wrap(built.createWrap);

export const FOOD_MODELS = {
    burger: createBurger,
    pizza: createPizza,
    pasta: createPasta,
    friedchicken: createFriedChicken,
    friedChicken: createFriedChicken,
    salmonsalad: createSalad,
    salad: createSalad,
    skewers: createSkewers,
    juice: createJuice,
    wrap: createWrap,
    friedplatter: createFriedPlatter,
    friedPlatter: createFriedPlatter,
    kebab: createKebab,
    roast: createRoast,
    coffeeset: createCoffeeSet,
    coffee: createCoffee,
    smoothie: createSmoothie,
    icedcoffee: createIcedCoffee,
    icedCoffee: createIcedCoffee
};

export function createFoodModel(type) {
    const builder = FOOD_MODELS[type];
    if (!builder) return null;
    const model = builder();
    model.name = type;
    return model;
}
