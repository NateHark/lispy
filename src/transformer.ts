export default class Transformer {
    transformDefToVarLambda(defExp: ListExpression): ListExpression {
        const [_tag, name, params, body] = defExp;
        return ['var', name, ['lambda', params, body]];
    }

    transformSwitchToIf(switchExp: ListExpression): ListExpression {
        const [_tag, ...cases] = switchExp;

        const ifExp: ListExpression = ['if', null, null, null];

        let current = ifExp;

        for (let i = 0; i < cases.length - 1; i++) {
            const [currentCond, currentBlock] = cases[i];

            current[1] = currentCond;
            current[2] = currentBlock;

            const next = cases[i + 1];
            const [nextCond, nextBlock] = next;

            current[3] = (nextCond === 'else') ? nextBlock : ['if'];

            current = current[3];
        }

        return ifExp;
    }

    transformForToWhile(forExp: ListExpression): ListExpression {
        const [_tag, init, condition, modifier, exp] = forExp;

        return ['begin', init, ['while', condition, ['begin', exp, modifier]]];
    }

    transformIncrementToAssignment(incExp: ListExpression): ListExpression {
        const [_tag, name] = incExp;

        return ['set', name, ['+', name, 1]];
    }

    transformIncrementByValueToAssignment(incExp: ListExpression): ListExpression {
        const [_tag, name, value] = incExp;
        return ['set', name, ['+', name, value]];
    }

    transformDecrementToAssignment(decExp: ListExpression): ListExpression {
        const [_tag, name] = decExp;
        return ['set', name, ['-', name, 1]];
    }

    transformDecrementByValueToAssignment(decExp: ListExpression): ListExpression {
        const [_tag, name, value] = decExp;
        return ['set', name, ['-', name, value]];
    }
}