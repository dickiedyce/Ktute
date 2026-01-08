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
});
