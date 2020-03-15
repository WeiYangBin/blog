# LSTM

循环神经网络（Recurrent Neural Network，RNN）是一种用于处理**序列**数据的神经网络

状态(states)
长短期记忆（LSTM）是一种特殊的RNN
- 主要是为了解决长序列训练过程中的**梯度消失**和**梯度爆炸**问题。

为什么要用RNN:因为我们理解每句话的每个词是不够的，我们需要处理这些词汇连接的整个序列；当我们处理视频时，我们也不能只单独的去分析每一帧，而要分析这些帧连接起来的序列

**在往长时记忆单元添加信息方面，加性规则要显著优于乘性规则。也证明了加法更适合做信息叠加，而乘法更适合做控制和缩放（scaling）。**


![image](https://note.youdao.com/yws/api/personal/file/F55D537633C94B9390F06236A5626507?method=download&shareKey=ed9ffd22e3f091369226cc8ba1618d7f)

![image](https://note.youdao.com/yws/api/personal/file/324C592E0C5F4CA1B95527EB325A0D13?method=download&shareKey=63c6017bc11333a53fdea7e6182d69e3)

### LSTM的三个门控单元
### 遗忘门(forget gate)

$$\Gamma_f^{(t)}
 = Sigmoid(W_f[h^{<t - 1>}, x^{t}] + b_f)$$

其中，
$$
W_f$$
是控制遗忘门行为的权重，我们Concatenate
$$
[h^{<t - 1>}, x^{t}]$$
乘上Wf,上面的方程得到一个值在0到1之间的向量,
这个遗忘门向量将按元素顺序乘以前一个单元格状态

$$
c^{<t-1>}$$
因此，如果


$$
\Gamma_f^{(t)}$$
的值之一为0(或接近于0)，则意味着LSTM应该删除

$$
c^{<t-1>}$$
的对应组件中的那部分信息(例如，单数)。如果其中一个值是1，那么它将保存信息。



遗忘门是用来控制记忆消失程度的，因此也要用乘性运算

### 输入门(input/update gate)

一旦我们忘记了正在讨论的主题是单数，我们需要找到一种方法来更新它，以反映新的主题现在是复数。下面是更新门的公式:

$$
\Gamma_u^{(t)} = Sigmoid(W_u[h^{<t - 1>}, x^{t}] + b_u)$$
与忘记门类似，这里

$$
\Gamma_f^{(u)}$$
也是0到1之间的值向量。这将与
$$
\tilde{c}^{<t>}$$
相乘，以便计算
$$
c^{<t>}$$
#### 更新细胞单元（Updating the cell）
要更新新主题，我们需要创建一个新的数字向量，可以将其添加到之前的单元格状态。我们用的方程是

$$
\tilde{c}^{<t>} = tanh(W_c[h^{<t - 1>}, x^{t}] + b_c)$$
最后，(Remember Gate)新的单元格state（状态）为
$$
c^{<t>} = \Gamma_f^{(t)}*c^{<t-1>}+ \Gamma_u^{(t)}*\tilde{c}^{<t>}$$
嗯～由于输入门只会在必要的时候开启，因此大部分情况下公式可以看成C(t)=C(t-1)，也就是我们最理想的状态。由此加性操作带来的梯度爆炸也大大减轻啦，梯度消失更更更轻了,
### 输出门（output gate)
为了确定我们将使用哪些输出，我们将使用以下两个公式

$$
\Gamma_o^{<t>} 
= Sigmoid(W_o[h^{<t - 1>}, x^{<t>}] + b_o)$$

$$h^{<t>} 
= \Gamma_o^{<t>} * tanh(c^{<t>})$$
在第一个公式中决定使用sigmoid function去输出什么，第二个公式，将它乘以前一状态的


