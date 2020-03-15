# Transformer

本文会以代码的运算过程来介绍Transformer，设计以下内容：
- 架构介绍
- 细节介绍

Transformers的模型整体如下图，且看且过，下面我会一一介绍

图1：
![image](https://note.youdao.com/yws/api/personal/file/WEB29d501cfae199c0366e8479a23777632?method=download&shareKey=d85c08f3d55fe3b62482985645c87b78)


我觉得网上的这张图更直观

图二：
![image](https://note.youdao.com/yws/api/personal/file/WEB6c766cb251fa37b236b05a148e2194db?method=download&shareKey=98a7db81ce82543d5e24e19581165cfd)

## 数据预处理
因为很多人对原理都有了解但对输入数据长什么样子还是一知半解，故而做了一个简单介绍。
原始训练数据之一如下：
```python
# file -> train.tags.de-en.de（德语）
"""
sents1 = 'David Gallo: Das ist Bill Lange. Ich bin Dave Gallo.'
"""

# file -> train.tags.en-de.en（英语）
"""
sents2 = David Gallo: This is Bill Lange. I'm Dave Gallo.'
"""
```
经过Perprocess和Segment，最终处理成如下数据
```python
# file -> train.de.bpe（德语）
"""
sents1 = '▁David ▁Gall o : ▁Das ▁ist ▁Bill ▁Lange . ▁Ich ▁bin ▁Dave ▁Gall o .'
"""

# file -> train.en.bpe（英语）
"""
sents2 = '▁David ▁Gall o : ▁This ▁is ▁Bill ▁Lange . ▁I ' m ▁Dave ▁Gall o .'
"""
```
部分词表如下
```python
token2idx (dic)

0 <pad>
1 <unk>
2 <s>
3 </s>
4 en
5 er
6 in
7 ▁t
...
95 ten
96 ▁is
97 ▁wir
98 ▁zu
99 ow
```
所以我们的数据最终会被转换成计算机可处理的格式
```python
# x, y 分别是sents1, sents2经过词表转换而来
x = [4416, 13146, 31931, 31976, 298, 100, 5101, 20907, 31943, 236, 862, 20545, 13146, 31931, 31943, 3]
y = [4416, 13146, 31931, 31976, 553, 96, 5101, 20907, 31943, 40, 31952, 31937, 20545, 13146, 31931, 31943, 3]
decoder_input = [2, 4416, 13146, 31931, 31976, 553, 96, 5101, 20907, 31943, 40, 31952, 31937, 20545, 13146, 31931, 31943]
x_seqlen = 16 
y_seqlen =17

# 到了这一步我们就得到一组输入数据了
xs = (x, x_seqlen, sents1)
ys = (decoder_input, y, y_seqlen, sents2)
```

## Encoder
1. 将处理好的xs输入到第一个Encoder（图二左边最底下的那个）,输入后需要取出xs中x做mask
- 为什么要mask？
```
目的是当输入句子中有padding时，注意力输出为零
```
 

2. 接着进行embedding_lookup操作。且在执行完lookup之后进行一个scale。
 - 为什么要embddding_lookup之后进行scale？
网上给出了两种答案[解释1](https://www.go2live.cn/nocate/%E7%BB%9D%E5%AF%B9%E5%B9%B2%E8%B4%A7%EF%BC%81nlp-%E9%A2%84%E8%AE%AD%E7%BB%83%E6%A8%A1%E5%9E%8B%EF%BC%9A%E4%BB%8E-transformer-%E5%88%B0-albert.html)
[解释2](https://github.com/Kyubyong/transformer/issues/130)

 
3. 之后我们通过sin，cos进行Position Encoding，后接一个dropout
- 为什么要Position Encoding？
```
目的是使输入具备绝对位置，位置编码会在词向量中加入单词的位置信息，这样就能区分不同位置的单词
```

![image](https://note.youdao.com/yws/api/personal/file/WEB290b3e35550a5ca33f81074928819c4f?method=download&shareKey=a03644e3e14dbc139c98b9169d27146d)

- Mulit-Head Attention的作用是什么？
```
给出了注意力层的多个“表示子空间”（representation subspaces)，有助于网络捕捉到更丰富的特征/信息
```



4. 将dropout的输出结果以及步骤1中mask的结果，送到**Mulit-Head Attention(MHA)**
 

5. 对输入(MHA)的特征进行线性运算映射生成**Q，K，V**再对Q，K，V进行split和concat得到**Q_, K_, V_**
 - 线性运算：
 
$$Q = W^qX\qquad K = W^kX\qquad V = W^vX$$


 - split和concat细节如下：无非是一个reshape 

$$(N, T_q, d_{model}) -> (N, T_q, \frac{d_{model}}{head}) -> (N * head, T_q, \frac{d_{model}}{head})$$



![image](https://note.youdao.com/yws/api/personal/file/WEBcfe78e24206fa1bf8bb3bba917156cc2?method=download&shareKey=031779c14c895e98d775bfeb37705969)

6. **Scaled Dot-Product Attention**这就比较好理解了，也就是论文提到的公式


$$Attention(Q, K, V) = softmax(\frac{QK^T}{\sqrt{d_k}})V$$

- 为什么要除以$d_k$的开方？
```
这里其实也是起到一个scale的作用，目的是为了让训练过程中的梯度更稳定
```


7. 接着将得到的Attention(Q, K, V) 的结果进行Activation，Residual Connect 以及LayerNormalization

8. 接着将MHA的输出送入**Feed Forward**，进行Activation，Residual connection，和LayerNormalization 得到第一个Encoder block的output

9. 按照paper的设定是6个Encoder Block，因为只对第一个block的输入做Position Encoding, 也就只需要loop（Step：5 - Step ：7）即可得到最终左侧整个Encoder的输出

## Dncoder
Decoder的部分基本与Encoder无异，无非是用了Encoder的输出以及多了一个attention部分，且听到一一道来
- 图一右侧输入的 shifted right 是什么？
```
 也就是我们上面数据处理的decoder_inputs, 带有<s>标识的数据
```
 
1. 将ys的decoder_input取出来，进行mask操作，目的是在预测下一个单词时，防止解码器在被翻译的句子，看到其余没有翻译的部分
 

2. 接着同样是进行embedding_lookup操作。且在执行完lookup之后进行一个scale。
 

3. 之后我们通过sin，cos进行Position Encoding，表示输入的绝对位置，后接一个dropout


4. 将dropout的输出结果和Dncoder第一步mask输出的结果，送到**Mask Mulit-head Attention(MMHA)** 其实MMHA与MHA无差别只不是是mask不同罢了


5. 对输入(MMHA)的特征进行线性映射生成**Q，K，V**在对Q，K，V进行split和concat分为多头得到**Q_, K_, V_** 与encoder无异


6. 同样是**Scaled Dot-Product Attention**计算也是同encoder一样

$$Attention(Q, K, V) = softmax(\frac{QK^T}{\sqrt{d_k}})V$$


7. 接着将Attention(Q, K, V) 进行Activation，Residual和LayerNormalization得到MMHA的输出
 

8. 这里有些不同，这边需要将MMHA的输出作为**Mulit-Head Attention(MHA)** 的Query的计算，++Encoder的最终输出作为Key和Value的计算输入++，++且这边的mask输入是Encoder的mask++，同样的对输入(MMHA)的特征进行线性映射生成**Q，K，V**在对Q，K，V进行split和concat分为多头得到**Q_, K_, V_** 接着还是**Scaled Dot-Product Attention**得到Afttentio(Q, K, V)
- 线性运算：
 
$$Q = W^q*Output_{MMHA}\qquad K = W^k * Ouput_{encoder}\qquad V = W^vOuput_{encoder}$$


9. 接着将Attention(Q, K, V) 进行Activation，Residual connect 和LayerNormalization得到MHA的输出
 

10. 接着将MHA的输出推到**Feed Forward Neural Network**，进行Activation，Residual connection，和LayerNormalization 得到第一个dencoder block的output
 

11. 那么也就只需要loop（Step：5 - Step ：10）即可得到最终Dncoder的输出
 

12. 最终通过一个线性层和一个softmax层得到最终的输出


讲完了整个结构好像还没看到Self-Attention, 说时迟那时快，图二中的一个Encoder部分可以细分成两个部分
![image](https://note.youdao.com/yws/api/personal/file/WEB1d557b2c564a17eb19af48b4ff2aad34?method=download&shareKey=bdcce4c8ee4db3b036ec94d1abac65fd)

也就是图一中的这个部分

![image](https://note.youdao.com/yws/api/personal/file/WEBb986d055483a77347c9082c6fe300738?method=download&shareKey=a35b86d003ad4f9d82df6b7269c702f7)


- Feed Forward的特点
```
每一层的输入互相独立不存在依赖关系，可并行计算
```


参考：

[Attention is all you need](https://arxiv.org/abs/1706.03762)

[Kyubyong/transformer 代码](https://github.com/Kyubyong/transformer)

[Google 源码](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/models)









