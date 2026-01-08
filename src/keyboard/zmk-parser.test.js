import { describe, it, expect } from 'vitest';
import { parseZmkKeymap, ZMK_TO_LABEL } from './zmk-parser.js';

describe('ZMK Parser', () => {
  describe('parseZmkKeymap', () => {
    it('should parse a simple keymap with one layer', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp Q &kp W &kp E &kp R
                &kp A &kp S &kp D &kp F
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers).toHaveLength(1);
      expect(result.layers[0].name).toBe('default_layer');
      expect(result.layers[0].keys).toEqual(['q', 'w', 'e', 'r', 'a', 's', 'd', 'f']);
    });

    it('should parse multiple layers', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp A &kp B
            >;
        };
        lower_layer {
            bindings = <
                &kp N1 &kp N2
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers).toHaveLength(2);
      expect(result.layers[0].name).toBe('default_layer');
      expect(result.layers[1].name).toBe('lower_layer');
    });

    it('should handle special keys', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp SPACE &kp RET &kp BSPC &kp TAB
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toEqual(['spc', 'ent', 'bspc', 'tab']);
    });

    it('should handle modifier keys', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp LSHFT &kp LCTRL &kp LALT &kp LGUI
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toEqual(['lsft', 'lctl', 'lalt', 'lgui']);
    });

    it('should handle punctuation keys', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp COMMA &kp DOT &kp FSLH &kp SEMI
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toEqual([',', '.', '/', ';']);
    });

    it('should handle transparent and none bindings', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &trans &none &kp A
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toEqual(['_', '_', 'a']);
    });

    it('should handle layer tap bindings', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &lt 1 SPACE &kp A
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      // Layer tap shows the tap key
      expect(result.layers[0].keys).toEqual(['spc', 'a']);
    });

    it('should handle mod tap bindings', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &mt LSHFT A &kp B
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      // Mod tap shows the tap key
      expect(result.layers[0].keys).toEqual(['a', 'b']);
    });

    it('should handle a full Corne keymap', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp TAB   &kp Q &kp W &kp F &kp P &kp B   &kp J &kp L  &kp U     &kp Y   &kp SEMI &kp BSPC
                &kp LCTRL &kp A &kp R &kp S &kp T &kp G   &kp M &kp N  &kp E     &kp I   &kp O    &kp SQT
                &kp LSHFT &kp Z &kp X &kp C &kp D &kp V   &kp K &kp H  &kp COMMA &kp DOT &kp FSLH &kp RSHFT
                              &kp LGUI &kp SPACE &kp RET   &kp BSPC &kp SPACE &kp RALT
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toHaveLength(42);
      expect(result.layers[0].keys[0]).toBe('tab');
      expect(result.layers[0].keys[1]).toBe('q');
      expect(result.layers[0].keys[11]).toBe('bspc');
    });

    it('should return empty layers for invalid input', () => {
      const result = parseZmkKeymap('not a valid keymap');
      expect(result.layers).toEqual([]);
    });

    it('should handle number keys', () => {
      const zmkConfig = `
/ {
    keymap {
        compatible = "zmk,keymap";
        default_layer {
            bindings = <
                &kp N1 &kp N2 &kp N3 &kp N0
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers[0].keys).toEqual(['1', '2', '3', '0']);
    });
  });

  describe('ZMK_TO_LABEL', () => {
    it('should have mappings for common keys', () => {
      expect(ZMK_TO_LABEL['SPACE']).toBe('spc');
      expect(ZMK_TO_LABEL['RET']).toBe('ent');
      expect(ZMK_TO_LABEL['BSPC']).toBe('bspc');
      expect(ZMK_TO_LABEL['TAB']).toBe('tab');
    });

    it('should have mappings for letters', () => {
      expect(ZMK_TO_LABEL['A']).toBe('a');
      expect(ZMK_TO_LABEL['Z']).toBe('z');
    });

    it('should have mappings for modifiers', () => {
      expect(ZMK_TO_LABEL['LSHFT']).toBe('lsft');
      expect(ZMK_TO_LABEL['RSHFT']).toBe('rsft');
      expect(ZMK_TO_LABEL['LCTRL']).toBe('lctl');
      expect(ZMK_TO_LABEL['LGUI']).toBe('lgui');
    });
  });

  describe('realistic keymaps', () => {
    it('should parse a keymap with custom behaviors and bluetooth', () => {
      const zmkConfig = `
/ {
    behaviors {
        gqt: global-quick-tap {
            compatible = "zmk,behavior-hold-tap";
            bindings = <&kp>, <&kp>;
        };
    };

    keymap {
        compatible = "zmk,keymap";

        default_layer {
            bindings = <
&gqt LS(TAB) TAB  &kp Q  &kp D  &kp R  &kp W  &kp B    &kp J  &kp F  &kp U  &kp P  &kp SEMI  &kp ESC
&gqt DEL BSPC     &kp A  &kp S  &kp H  &kp T  &kp G    &kp Y  &kp N  &kp E  &kp O  &kp I     &kp SQT
&kp LSHFT         &kp Z  &kp X  &kp M  &kp C  &kp V    &kp K  &kp L  &kp COMMA  &kp DOT  &kp FSLH  &kp RCTRL
                                &kp LALT  &kp LGUI  &lt 1 SPACE    &kp RET  &mo 1  &kp TILDE
            >;
        };

        lower_layer {
            bindings = <
&bt BT_CLR  &bt BT_SEL 0  &bt BT_SEL 1  &bt BT_SEL 2  &bt BT_SEL 3  &bt BT_SEL 4    &kp C_VOLUME_UP  &kp LEFT  &kp DOWN  &kp UP  &kp RIGHT  &trans
&trans      &kp F1        &kp F2        &kp F3        &kp F4        &kp F5          &kp K_MUTE       &kp HOME  &kp PG_DN &kp PG_UP &kp END  &studio_unlock
                                        &trans        &trans        &trans          &trans           &trans    &trans
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      
      expect(result.layers).toHaveLength(2);
      
      // Check base layer - custom behavior should extract tap key
      const baseKeys = result.layers[0].keys;
      expect(baseKeys[0]).toBe('tab');  // &gqt LS(TAB) TAB -> TAB
      expect(baseKeys[1]).toBe('q');
      expect(baseKeys[6]).toBe('j');
      expect(baseKeys[12]).toBe('bspc'); // &gqt DEL BSPC -> BSPC
      expect(baseKeys[24]).toBe('lsft');
      expect(baseKeys[30]).toBe('k');
      expect(baseKeys[36]).toBe('lalt');
      expect(baseKeys[38]).toBe('spc'); // &lt 1 SPACE -> SPACE
      expect(baseKeys[40]).toBe('mo');  // &mo 1
      
      // Check lower layer - bluetooth bindings
      const lowerKeys = result.layers[1].keys;
      expect(lowerKeys[0]).toBe('btclr'); // &bt BT_CLR
      expect(lowerKeys[1]).toBe('bt0');   // &bt BT_SEL 0
      expect(lowerKeys[6]).toBe('vol+');  // &kp C_VOLUME_UP
      expect(lowerKeys[12]).toBe('_');    // &trans
      expect(lowerKeys[18]).toBe('mute'); // &kp K_MUTE
    });

    it('should handle bracket and punctuation keys correctly', () => {
      const zmkConfig = `
/ {
    keymap {
        default_layer {
            bindings = <
                &kp LBKT &kp RBKT &kp LBRC &kp RBRC &kp LPAR &kp RPAR &kp LT &kp GT &kp PIPE &kp QMARK
            >;
        };
    };
};`;

      const result = parseZmkKeymap(zmkConfig);
      expect(result.layers[0].keys).toEqual(['[', ']', '{', '}', '(', ')', '<', '>', '|', '?']);
    });
  });
});
