import java.io.File
import java.io.FileReader
import java.util.stream.Stream

fun main(args: Array<String>) {
    FileReader(File("./input.txt")).buffered().use {
        main(it.lines())
    }
}

fun doExample() {
//    b inc 5 if a > 1
//    a inc 1 if b < 5
//    c dec -10 if a >= 1
//    c inc -20 if c == 10
    val lines = listOf("b inc 5 if a > 1", "a inc 1 if b < 5", "c dec -10 if a >= 1", "c inc -20 if c == 10")
    main(lines.stream())
}

fun main(instructionLines: Stream<String>) {
    val registers = HashMap<String, Int>()
    var overallMax = Int.MIN_VALUE
    instructionLines.forEach({
        line -> parseInstruction(line).perform(registers)
                val currentMax = registers.values.max() ?: Int.MIN_VALUE
                if (currentMax > overallMax) {
                    overallMax = currentMax
                }

    })
    println(registers)
    val maxValue = registers.values.max()
    println("current max value is $maxValue")
    println("overall max value seen is $overallMax")
}

enum class Operator(val token : String) {
    GT(">"),
    LT("<"),
    GTE(">="),
    LTE("<="),
    EQ("=="),
    NE("!=")
}

fun parseOperator(token: String) : Operator {
    Operator.values()
            .filter { token == it.token }
            .forEach { return it }
    throw IllegalArgumentException("token does not represent an operator: " + token);
}

class Condition(
        val label : String,
        val operator : Operator,
        val reference : Int
) {
    fun evaluate(registers: Map<String, Int>) : Boolean {
        val query = registers.getOrDefault(label, 0)
        return when (operator) {
            Operator.GT -> query > reference
            Operator.GTE -> query >= reference
            Operator.LT -> query < reference
            Operator.LTE -> query <= reference
            Operator.EQ -> query == reference
            Operator.NE -> query != reference
        }
    }
}

class Instruction(
        val target: String,
        val delta: Int,
        val condition : Condition
) {
    fun perform(registers: MutableMap<String, Int>) {
        var value = registers.getOrDefault(target, 0)
        if (condition.evaluate(registers)) {
            value += delta
        }
        registers.put(target, value)
    }
}

fun parseInstruction(line: String): Instruction {
    val tokens = line.split(Regex("\\s+"))
    val delta = tokens[2].toInt() * (if ("inc" == tokens[1]) 1 else -1)
    val condition = Condition(tokens[4], parseOperator(tokens[5]), tokens[6].toInt())
    return Instruction(tokens[0], delta, condition)
}